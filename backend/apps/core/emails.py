import json
import logging
import urllib.request
import urllib.error
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_via_resend(api_key, from_email, recipients, subject, html_content, text_content=None, reply_to=None):
    """
    Direct HTTP POST to Resend API v1.
    Bypasses port 587/SMTP blocks entirely.
    """
    url = "https://api.resend.com/emails"
    payload = {
        "from": from_email or "LaundryGo <onboarding@resend.dev>",
        "to": recipients if isinstance(recipients, list) else [recipients],
        "subject": subject,
        "html": html_content or (f"<pre>{text_content}</pre>" if text_content else ""),
    }
    if text_content:
        payload["text"] = text_content
    if reply_to:
        payload["reply_to"] = reply_to

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "LaundryGo-Backend/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        raise RuntimeError(f"Resend HTTP {e.code}: {err_msg}")


def send_via_sendgrid(api_key, from_email, recipients, subject, html_content, text_content=None, reply_to=None):
    """
    Direct HTTP POST to SendGrid v3 API.
    Bypasses port 587/SMTP blocks entirely.
    """
    url = "https://api.sendgrid.com/v3/mail/send"
    sender_name = "LaundryGo"
    sender_email = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "info@thelaundrygo.com")
    if "<" in sender_email and ">" in sender_email:
        sender_name = sender_email.split("<")[0].strip() or sender_name
        sender_email = sender_email.split("<")[1].split(">")[0].strip()

    to_list = [{"email": r} for r in (recipients if isinstance(recipients, list) else [recipients])]
    content = []
    if text_content:
        content.append({"type": "text/plain", "value": text_content})
    if html_content:
        content.append({"type": "text/html", "value": html_content})
    elif text_content:
        content.append({"type": "text/html", "value": f"<pre>{text_content}</pre>"})

    payload = {
        "personalizations": [{"to": to_list}],
        "from": {"email": sender_email, "name": sender_name},
        "subject": subject,
        "content": content,
    }
    if reply_to:
        payload["reply_to"] = {"email": reply_to}

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "LaundryGo-Backend/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return {"status": resp.status}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        raise RuntimeError(f"SendGrid HTTP {e.code}: {err_msg}")


def _get_fallback_from_email(active_from_email):
    """
    If a brand-specific from_email (e.g. 'GoPropertyCare <info@gopropertycare.com>') is rejected
    because the SMTP server or API key only authorizes DEFAULT_FROM_EMAIL / EMAIL_HOST_USER,
    preserve the brand display name while using the authorized sender address.
    """
    default_from = getattr(settings, "DEFAULT_FROM_EMAIL", "info@thelaundrygo.com")
    host_user = getattr(settings, "EMAIL_HOST_USER", "")
    base_addr = default_from
    if "<" in default_from and ">" in default_from:
        base_addr = default_from.split("<")[1].split(">")[0].strip()
    elif host_user and "@" in host_user:
        base_addr = host_user.strip()

    if "<" in active_from_email and ">" in active_from_email:
        brand_name = active_from_email.split("<")[0].strip()
        current_addr = active_from_email.split("<")[1].split(">")[0].strip()
        if current_addr.lower() != base_addr.lower() and brand_name:
            return f"{brand_name} <{base_addr}>"
    elif active_from_email.strip().lower() != base_addr.lower():
        return default_from
    return None


def send_mail_worker(subject, text_content, html_content, recipients, reply_to=None, from_email=None):
    """
    Background worker that dispatches emails.
    Primary: Standard Django Email Backend (SMTP with IPv4 socket resolution or Console).
    Fallback 1: Resend REST API (HTTPS) if configured and SMTP fails.
    Fallback 2: SendGrid REST API (HTTPS) if configured and previous options fail.
    """
    active_from_email = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "info@thelaundrygo.com")
    fallback_from_email = _get_fallback_from_email(active_from_email)
    reply_to_list = [reply_to] if reply_to else [getattr(settings, "ADMIN_EMAIL", "info@thelaundrygo.com")]
    resend_api_key = getattr(settings, "RESEND_API_KEY", None)
    sendgrid_api_key = getattr(settings, "SENDGRID_API_KEY", None)
    is_console_backend = "console" in getattr(settings, "EMAIL_BACKEND", "").lower()

    # 1. Primary: Standard Django Email (SMTP / Locmem / Console when no HTTPS API keys are set)
    if not (is_console_backend and (resend_api_key or sendgrid_api_key)):
        for candidate_from in [active_from_email, fallback_from_email]:
            if not candidate_from:
                continue
            try:
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=candidate_from,
                    to=recipients if isinstance(recipients, list) else [recipients],
                    reply_to=reply_to_list,
                )
                if html_content:
                    msg.attach_alternative(html_content, "text/html")

                sent_count = msg.send(fail_silently=False)
                logger.info(
                    f"[EMAIL SUCCESS - SMTP] Successfully sent '{subject}' from '{candidate_from}' to {recipients} (delivered: {sent_count})"
                )
                return
            except Exception as smtp_err:
                logger.warning(
                    f"[EMAIL WARNING - SMTP] Delivery failed from '{candidate_from}' for '{subject}' to {recipients}: {smtp_err}."
                )

    # 2. Fallback: Resend REST API (if key is configured and SMTP failed)
    if resend_api_key:
        for candidate_from in [active_from_email, fallback_from_email]:
            if not candidate_from:
                continue
            try:
                result = send_via_resend(
                    resend_api_key,
                    candidate_from,
                    recipients,
                    subject,
                    html_content,
                    text_content,
                    reply_to,
                )
                logger.info(f"[EMAIL SUCCESS - RESEND FALLBACK] Sent '{subject}' from '{candidate_from}' to {recipients}: {result}")
                return
            except Exception as ex:
                logger.error(f"[EMAIL FAILURE - RESEND FALLBACK] Failed sending from '{candidate_from}' to {recipients}: {ex}")

    # 3. Fallback: SendGrid REST API (if key is configured)
    if sendgrid_api_key:
        for candidate_from in [active_from_email, fallback_from_email]:
            if not candidate_from:
                continue
            try:
                result = send_via_sendgrid(
                    sendgrid_api_key,
                    candidate_from,
                    recipients,
                    subject,
                    html_content,
                    text_content,
                    reply_to,
                )
                logger.info(f"[EMAIL SUCCESS - SENDGRID FALLBACK] Sent '{subject}' from '{candidate_from}' to {recipients}: {result}")
                return
            except Exception as ex:
                logger.error(f"[EMAIL FAILURE - SENDGRID FALLBACK] Failed sending from '{candidate_from}' to {recipients}: {ex}")
