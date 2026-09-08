import logging
import threading
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)

from apps.core.emails import (
    send_mail_worker as _send_mail_worker,
    send_via_resend as _send_via_resend,
    send_via_sendgrid as _send_via_sendgrid,
)


def send_order_confirmation_email(order, language=None):
    """
    Dispatches order confirmation email to customer and notification to admin,
    rendered in the customer's preferred language (English or Spanish).
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = order.customer_name or "Valued Customer"
        phone = order.guest_phone or (order.user.phone if order.user else "N/A")
        service_name = order.service_rate.name if order.service_rate else "Standard"
        rate_per_lb = order.service_rate.rate_per_lb if order.service_rate else "2.25"

        recipients = [settings.ADMIN_EMAIL]
        if customer_email and customer_email.lower() != settings.ADMIN_EMAIL.lower():
            recipients.append(customer_email)

        # Detect language (Order attribute, explicit argument, or default English)
        lang = (language or getattr(order, 'language', None) or 'en').strip().lower()
        is_spanish = lang.startswith('es')

        if is_spanish:
            time_slot = (
                "Mañana (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Tarde (12:00 PM - 4:00 PM)"
            )
            delivery_fee_str = (
                "GRATIS ($0.00)"
                if float(order.delivery_fee or 0) == 0
                else f"${order.delivery_fee}"
            )
            zone_display = "Zona Central (Denver / Boulder)" if order.delivery_zone == 'inner' else "Zona Exterior (Recargo)"
            instructions = order.pickup_instructions or 'Ninguna especificada'
            subject = f"🔔 Confirmación de Pedido LaundryGo #{order.id}"

            text_content = (
                f"¡Gracias por tu pedido con LaundryGo!\n\n"
                f"DATOS DE LA ORDEN #{order.id}\n"
                f"----------------------------------------\n"
                f"• Cliente: {customer_name}\n"
                f"• Correo: {customer_email or 'N/A'}\n"
                f"• Teléfono: {phone}\n"
                f"• Dirección: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Tarifa de Entrega: {delivery_fee_str} ({zone_display})\n\n"
                f"DETALLES DEL SERVICIO\n"
                f"----------------------------------------\n"
                f"• Servicio: {service_name} (${rate_per_lb}/lb)\n"
                f"• Fecha de Recolección: {order.pickup_date}\n"
                f"• Horario de Recolección: {time_slot}\n"
                f"• Detalles / Add-ons: {order.order_details}\n"
                f"• Instrucciones Especiales: {instructions}\n\n"
                f"Si tienes alguna pregunta, puedes responder directamente a este correo o llamarnos al (720) 590-8632.\n\n"
                f"Equipo LaundryGo Denver"
            )

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
                .header {{ background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 30px 24px; text-align: center; color: #ffffff; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
                .header p {{ margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }}
                .content {{ padding: 28px 24px; }}
                .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; margin-bottom: 12px; }}
                .section-title {{ font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }}
                .table-details {{ width: 100%; border-collapse: collapse; margin-top: 8px; }}
                .table-details td {{ padding: 8px 4px; font-size: 14px; vertical-align: top; }}
                .table-details td.label {{ color: #64748b; width: 38%; font-weight: 500; }}
                .table-details td.value {{ color: #0f172a; font-weight: 600; }}
                .instructions-box {{ background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0; font-size: 13px; color: #334155; }}
                .footer {{ background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
                .footer a {{ color: #2563eb; text-decoration: none; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🧺 LaundryGo</h1>
                  <p>Servicio Premium de Lavandería en Denver &bull; Recolección y Entrega</p>
                </div>
                <div class="content">
                  <span class="badge">ORDEN #{order.id} CONFIRMADA</span>
                  <p style="margin: 0 0 16px 0; font-size: 15px;">Hola <strong>{customer_name}</strong>, hemos recibido tu solicitud de recolección.</p>
                  
                  <div class="section-title">📅 Horario de Recolección</div>
                  <table class="table-details">
                    <tr><td class="label">Fecha Programada:</td><td class="value">{order.pickup_date}</td></tr>
                    <tr><td class="label">Franja Horaria:</td><td class="value">{time_slot}</td></tr>
                    <tr><td class="label">Servicio:</td><td class="value">{service_name} (${rate_per_lb}/lb)</td></tr>
                  </table>

                  <div class="section-title">📍 Ubicación de Recolección</div>
                  <table class="table-details">
                    <tr><td class="label">Dirección:</td><td class="value">{order.street_address}, {order.city} {order.zip_code}</td></tr>
                    <tr><td class="label">Teléfono de Contacto:</td><td class="value">{phone}</td></tr>
                    <tr><td class="label">Zona de Entrega:</td><td class="value">{zone_display} ({delivery_fee_str})</td></tr>
                  </table>

                  <div class="section-title">🧺 Detalles e Instrucciones</div>
                  <div class="instructions-box">
                    <strong>Detalles:</strong> {order.order_details}<br>
                    <strong>Instrucciones:</strong> {instructions}
                  </div>
                </div>
                <div class="footer">
                  <p style="margin: 0 0 6px 0;"><strong>LaundryGo Denver, Colorado</strong></p>
                  <p style="margin: 0;">Teléfono: <a href="tel:7205908632">(720) 590-8632</a> &bull; Email: <a href="mailto:info@thelaundrygo.com">info@thelaundrygo.com</a></p>
                </div>
              </div>
            </body>
            </html>
            """
        else:
            # English (Default)
            time_slot = (
                "Morning (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Afternoon (12:00 PM - 4:00 PM)"
            )
            delivery_fee_str = (
                "FREE ($0.00)"
                if float(order.delivery_fee or 0) == 0
                else f"${order.delivery_fee}"
            )
            zone_display = "Downtown Denver / Boulder Zone (FREE)" if order.delivery_zone == 'inner' else "Outer Metro Zone ($25 Fee)"
            instructions = order.pickup_instructions or 'None specified'
            subject = f"🔔 LaundryGo Order Confirmation #{order.id}"

            text_content = (
                f"Thank you for your order with LaundryGo!\n\n"
                f"ORDER DETAILS #{order.id}\n"
                f"----------------------------------------\n"
                f"• Customer: {customer_name}\n"
                f"• Email: {customer_email or 'N/A'}\n"
                f"• Phone: {phone}\n"
                f"• Address: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Delivery Fee: {delivery_fee_str} ({zone_display})\n\n"
                f"SERVICE DETAILS\n"
                f"----------------------------------------\n"
                f"• Speed: {service_name} (${rate_per_lb}/lb)\n"
                f"• Pickup Date: {order.pickup_date}\n"
                f"• Pickup Window: {time_slot}\n"
                f"• Order Details / Add-ons: {order.order_details}\n"
                f"• Special Instructions: {instructions}\n\n"
                f"If you have any questions, reply directly to this email or call us at (720) 590-8632.\n\n"
                f"The LaundryGo Denver Team"
            )

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
                .header {{ background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 30px 24px; text-align: center; color: #ffffff; }}
                .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
                .header p {{ margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }}
                .content {{ padding: 28px 24px; }}
                .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; margin-bottom: 12px; }}
                .section-title {{ font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }}
                .table-details {{ width: 100%; border-collapse: collapse; margin-top: 8px; }}
                .table-details td {{ padding: 8px 4px; font-size: 14px; vertical-align: top; }}
                .table-details td.label {{ color: #64748b; width: 38%; font-weight: 500; }}
                .table-details td.value {{ color: #0f172a; font-weight: 600; }}
                .instructions-box {{ background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0; font-size: 13px; color: #334155; }}
                .footer {{ background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
                .footer a {{ color: #2563eb; text-decoration: none; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🧺 LaundryGo</h1>
                  <p>Premium Laundry Service in Denver &bull; Pickup &amp; Delivery</p>
                </div>
                <div class="content">
                  <span class="badge">ORDER #{order.id} CONFIRMED</span>
                  <p style="margin: 0 0 16px 0; font-size: 15px;">Hello <strong>{customer_name}</strong>, we have received your laundry pickup request.</p>
                  
                  <div class="section-title">📅 Pickup Schedule</div>
                  <table class="table-details">
                    <tr><td class="label">Scheduled Date:</td><td class="value">{order.pickup_date}</td></tr>
                    <tr><td class="label">Pickup Window:</td><td class="value">{time_slot}</td></tr>
                    <tr><td class="label">Service Speed:</td><td class="value">{service_name} (${rate_per_lb}/lb)</td></tr>
                  </table>

                  <div class="section-title">📍 Pickup Location</div>
                  <table class="table-details">
                    <tr><td class="label">Address:</td><td class="value">{order.street_address}, {order.city} {order.zip_code}</td></tr>
                    <tr><td class="label">Contact Phone:</td><td class="value">{phone}</td></tr>
                    <tr><td class="label">Delivery Zone:</td><td class="value">{zone_display} ({delivery_fee_str})</td></tr>
                  </table>

                  <div class="section-title">🧺 Details &amp; Instructions</div>
                  <div class="instructions-box">
                    <strong>Details:</strong> {order.order_details}<br>
                    <strong>Instructions:</strong> {instructions}
                  </div>
                </div>
                <div class="footer">
                  <p style="margin: 0 0 6px 0;"><strong>LaundryGo Denver, Colorado</strong></p>
                  <p style="margin: 0;">Phone: <a href="tel:7205908632">(720) 590-8632</a> &bull; Email: <a href="mailto:info@thelaundrygo.com">info@thelaundrygo.com</a></p>
                </div>
              </div>
            </body>
            </html>
            """

        threading.Thread(
            target=_send_mail_worker,
            args=(subject, text_content, html_content, recipients),
            kwargs={"reply_to": settings.ADMIN_EMAIL},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing order confirmation email #{order.id}: {e}", exc_info=True)


def send_order_cancellation_email(order, language=None):
    """
    Dispatches cancellation notification email to customer and admin,
    rendered in the customer's preferred language (English or Spanish).
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = order.customer_name or "Valued Customer"
        service_name = order.service_rate.name if order.service_rate else "Standard"

        recipients = [settings.ADMIN_EMAIL]
        if customer_email and customer_email.lower() != settings.ADMIN_EMAIL.lower():
            recipients.append(customer_email)

        # Detect language (Order attribute, explicit argument, or default English)
        lang = (language or getattr(order, 'language', None) or 'en').strip().lower()
        is_spanish = lang.startswith('es')

        if is_spanish:
            time_slot = (
                "Mañana (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Tarde (12:00 PM - 4:00 PM)"
            )
            subject = f"❌ Cancelación de Orden LaundryGo #{order.id}"

            text_content = (
                f"La orden #{order.id} ha sido cancelada.\n\n"
                f"DATOS DE LA ORDEN CANCELADA\n"
                f"----------------------------------------\n"
                f"• Cliente: {customer_name}\n"
                f"• Correo: {customer_email or 'N/A'}\n"
                f"• Servicio: {service_name}\n"
                f"• Fecha Programada: {order.pickup_date} ({time_slot})\n"
                f"• Estado Actual: Cancelada\n\n"
                f"Si tienes alguna duda o deseas reprogramar tu servicio, contáctanos en info@thelaundrygo.com o al (720) 590-8632.\n\n"
                f"Equipo LaundryGo"
            )

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
                .header {{ background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; text-align: center; color: #ffffff; }}
                .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; }}
                .content {{ padding: 24px; }}
                .footer {{ background: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Orden #{order.id} Cancelada</h1>
                </div>
                <div class="content">
                  <p>Hola <strong>{customer_name}</strong>,</p>
                  <p>Te confirmamos que la orden <strong>#{order.id}</strong> programada para el día <strong>{order.pickup_date} ({time_slot})</strong> ha sido cancelada.</p>
                  <p>Si deseas programar una nueva recolección, puedes hacerlo en cualquier momento desde <a href="https://thelaundrygo.com/schedule" style="color: #2563eb; font-weight: 600;">nuestra plataforma</a>.</p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">LaundryGo Denver &bull; (720) 590-8632 &bull; <a href="mailto:info@thelaundrygo.com">info@thelaundrygo.com</a></p>
                </div>
              </div>
            </body>
            </html>
            """
        else:
            # English (Default)
            time_slot = (
                "Morning (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Afternoon (12:00 PM - 4:00 PM)"
            )
            subject = f"❌ LaundryGo Order #{order.id} Cancelled"

            text_content = (
                f"Order #{order.id} has been cancelled.\n\n"
                f"CANCELLED ORDER DETAILS\n"
                f"----------------------------------------\n"
                f"• Customer: {customer_name}\n"
                f"• Email: {customer_email or 'N/A'}\n"
                f"• Service: {service_name}\n"
                f"• Scheduled Date: {order.pickup_date} ({time_slot})\n"
                f"• Current Status: Cancelled\n\n"
                f"If you have any questions or would like to reschedule your pickup, contact us at info@thelaundrygo.com or call (720) 590-8632.\n\n"
                f"The LaundryGo Team"
            )

            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
                .header {{ background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px; text-align: center; color: #ffffff; }}
                .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; }}
                .content {{ padding: 24px; }}
                .footer {{ background: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Order #{order.id} Cancelled</h1>
                </div>
                <div class="content">
                  <p>Hello <strong>{customer_name}</strong>,</p>
                  <p>We confirm that order <strong>#{order.id}</strong> scheduled for <strong>{order.pickup_date} ({time_slot})</strong> has been cancelled.</p>
                  <p>If you would like to schedule a new pickup, you can do so anytime at <a href="https://thelaundrygo.com/schedule" style="color: #2563eb; font-weight: 600;">our website</a>.</p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">LaundryGo Denver &bull; (720) 590-8632 &bull; <a href="mailto:info@thelaundrygo.com">info@thelaundrygo.com</a></p>
                </div>
              </div>
            </body>
            </html>
            """

        threading.Thread(
            target=_send_mail_worker,
            args=(subject, text_content, html_content, recipients),
            kwargs={"reply_to": settings.ADMIN_EMAIL},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing cancellation email #{order.id}: {e}", exc_info=True)
