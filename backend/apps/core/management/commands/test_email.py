import socket
from django.core.management.base import BaseCommand
from django.core.mail import get_connection, send_mail
from django.conf import settings


class Command(BaseCommand):
    help = "Test current email configuration and send a diagnostic email"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            nargs="?",
            default=settings.ADMIN_EMAIL,
            help="Recipient email address (defaults to ADMIN_EMAIL)",
        )

    def handle(self, *args, **options):
        recipient = options["recipient"]
        self.stdout.write(self.style.NOTICE("=" * 60))
        self.stdout.write(self.style.NOTICE("[DIAGNOSTIC] LaundryGo Email Diagnostic Utility"))
        self.stdout.write(self.style.NOTICE("=" * 60))
        self.stdout.write(f"- EMAIL_BACKEND:       {settings.EMAIL_BACKEND}")
        self.stdout.write(f"- EMAIL_HOST:          {settings.EMAIL_HOST}")
        self.stdout.write(f"- EMAIL_PORT:          {settings.EMAIL_PORT}")
        self.stdout.write(f"- EMAIL_HOST_USER:     {settings.EMAIL_HOST_USER or '(Not set)'}")
        self.stdout.write(f"- EMAIL_HOST_PASSWORD: {'*' * 8 if settings.EMAIL_HOST_PASSWORD else '(Not set)'}")
        self.stdout.write(f"- EMAIL_USE_TLS:       {getattr(settings, 'EMAIL_USE_TLS', False)}")
        self.stdout.write(f"- EMAIL_USE_SSL:       {getattr(settings, 'EMAIL_USE_SSL', False)}")
        self.stdout.write(f"- EMAIL_TIMEOUT:       {getattr(settings, 'EMAIL_TIMEOUT', 15)}s")
        self.stdout.write(f"- DEFAULT_FROM_EMAIL:  {settings.DEFAULT_FROM_EMAIL}")
        self.stdout.write(f"- ADMIN_EMAIL:         {settings.ADMIN_EMAIL}")
        self.stdout.write(f"- RESEND_API_KEY:      {'*' * 8 if getattr(settings, 'RESEND_API_KEY', '') else '(Not set)'}")
        self.stdout.write(f"- SENDGRID_API_KEY:    {'*' * 8 if getattr(settings, 'SENDGRID_API_KEY', '') else '(Not set)'}")
        self.stdout.write(f"- Target Recipient:    {recipient}")
        self.stdout.write(self.style.NOTICE("-" * 60))

        # Check Resend API First (Primary for Render Cloud)
        resend_key = getattr(settings, "RESEND_API_KEY", "")
        if resend_key:
            self.stdout.write("[MODE] Using Resend REST API over HTTPS (Port 443 - Fully compatible with Render Free Tier)")
            self.stdout.write("1. Sending test email via https://api.resend.com/emails...")
            from apps.orders.emails import _send_via_resend
            try:
                result = _send_via_resend(
                    resend_key,
                    settings.DEFAULT_FROM_EMAIL,
                    [recipient],
                    "LaundryGo - Email System Diagnostic (Resend API)",
                    "<h3>LaundryGo Diagnostic</h3><p>Your email system is 100% operational via Resend API!</p>",
                    "LaundryGo Diagnostic: Your email system is operational via Resend API!",
                    settings.ADMIN_EMAIL,
                )
                self.stdout.write(self.style.SUCCESS(f"   [SUCCESS] Resend accepted message: {result}"))
                self.stdout.write(self.style.SUCCESS(f"   🎉 Check the inbox at {recipient}!"))
                return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   [ERROR] Resend API failed: {e}"))
                return

        # Check SendGrid API
        sendgrid_key = getattr(settings, "SENDGRID_API_KEY", "")
        if sendgrid_key:
            self.stdout.write("[MODE] Using SendGrid REST API over HTTPS (Port 443)")
            self.stdout.write("1. Sending test email via https://api.sendgrid.com/v3/mail/send...")
            from apps.orders.emails import _send_via_sendgrid
            try:
                result = _send_via_sendgrid(
                    sendgrid_key,
                    settings.DEFAULT_FROM_EMAIL,
                    [recipient],
                    "LaundryGo - Email System Diagnostic (SendGrid API)",
                    "<h3>LaundryGo Diagnostic</h3><p>Your email system is 100% operational via SendGrid API!</p>",
                    "LaundryGo Diagnostic: Your email system is operational via SendGrid API!",
                    settings.ADMIN_EMAIL,
                )
                self.stdout.write(self.style.SUCCESS(f"   [SUCCESS] SendGrid accepted message: {result}"))
                self.stdout.write(self.style.SUCCESS(f"   🎉 Check the inbox at {recipient}!"))
                return
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   [ERROR] SendGrid API failed: {e}"))
                return

        # Fallback to SMTP
        if "console" in settings.EMAIL_BACKEND.lower():
            self.stdout.write(self.style.WARNING("[NOTICE] EMAIL_BACKEND is set to Console backend."))
            self.stdout.write(self.style.WARNING("   To send real emails, set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in your environment."))

        if "smtp" in settings.EMAIL_BACKEND.lower():
            self.stdout.write(f"1. Testing TCP socket connection to {settings.EMAIL_HOST}:{settings.EMAIL_PORT}...")
            try:
                sock = socket.create_connection(
                    (settings.EMAIL_HOST, settings.EMAIL_PORT),
                    timeout=getattr(settings, "EMAIL_TIMEOUT", 15)
                )
                sock.close()
                self.stdout.write(self.style.SUCCESS("   [OK] TCP socket connected successfully!"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   [ERROR] TCP connection failed: {e}"))
                return

            self.stdout.write("2. Testing SMTP connection & authentication handshake...")
            try:
                connection = get_connection(fail_silently=False)
                connection.open()
                self.stdout.write(self.style.SUCCESS("   [OK] SMTP authentication and handshake succeeded!"))
                connection.close()
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   [ERROR] SMTP Handshake/Auth failed: {e}"))
                if "535" in str(e) or "Username and Password not accepted" in str(e):
                    self.stdout.write(self.style.NOTICE("   Hint: For Gmail, use a 16-character App Password, NOT your personal account password."))
                    self.stdout.write(self.style.NOTICE("   Generate at: https://myaccount.google.com/apppasswords"))
                return

        self.stdout.write(f"3. Sending test email to {recipient}...")
        try:
            subject = "LaundryGo - Email System Diagnostic Test"
            message = (
                "Hello,\n\n"
                "This is a diagnostic test email sent from LaundryGo.\n"
                "If you received this message, the email delivery system is working 100% correctly in production!\n\n"
                "Best regards,\n"
                "LaundryGo Operations"
            )
            html_message = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-top: 0;">LaundryGo - Email Diagnostic Test</h2>
                <p>Hello,</p>
                <p>This is a diagnostic test email sent from your <strong>LaundryGo</strong> application.</p>
                <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 20px 0;">
                    <strong style="color: #166534;">Status: Operational</strong>
                    <p style="margin: 4px 0 0 0; color: #166534;">If you received this message, your email dispatch pipeline is functioning properly!</p>
                </div>
                <p style="color: #64748b; font-size: 13px; margin-top: 30px;">LaundryGo Denver &bull; Pickup & Delivery Service</p>
            </div>
            """
            send_mail(
                subject=subject,
                message=message,
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"   [SUCCESS] Test email successfully processed for {recipient}!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"   [ERROR] Failed to send email: {e}"))
