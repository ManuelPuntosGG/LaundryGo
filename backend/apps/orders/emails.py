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


def _build_laundry_recipients(customer_email):
    company_email = "info@thelaundrygo.com"
    admin_email = getattr(settings, "ADMIN_EMAIL", company_email) or company_email
    recipients = []
    for addr in (customer_email, company_email, admin_email):
        clean_addr = (addr or "").strip()
        if clean_addr and all(clean_addr.lower() != r.lower() for r in recipients):
            recipients.append(clean_addr)
    return recipients


def send_order_confirmation_email(order, language=None):
    """
    Dispatches order request confirmation email to customer and copy to company/admin,
    rendered in the customer's preferred language (English or Spanish).
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = (order.customer_name or "").strip() or "Valued Customer"
        phone = order.guest_phone or (order.user.phone if order.user else "N/A")
        service_name = order.service_rate.name if order.service_rate else "Standard"
        rate_per_lb = order.service_rate.rate_per_lb if order.service_rate else "2.25"
        quoted_total = float(order.total_price or 40.00)
        base_price = float(order.base_price or max(0.0, quoted_total - float(order.delivery_fee or 0)))

        recipients = _build_laundry_recipients(customer_email)

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
                else f"${float(order.delivery_fee):.2f}"
            )
            zone_display = "Zona Central (Denver / Boulder)" if order.delivery_zone == 'inner' else "Zona Exterior (Recargo)"
            instructions = order.pickup_instructions or 'Ninguna especificada'
            subject = f"🔔 Solicitud de Pedido LaundryGo #{order.id}"

            text_content = (
                f"¡Gracias por tu solicitud de servicio con LaundryGo!\n\n"
                f"DATOS DE LA SOLICITUD DE ORDEN #{order.id}\n"
                f"----------------------------------------\n"
                f"• Cliente: {customer_name}\n"
                f"• Correo: {customer_email or 'N/A'}\n"
                f"• Teléfono: {phone}\n"
                f"• Dirección: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Tarifa de Entrega: {delivery_fee_str} ({zone_display})\n\n"
                f"DETALLES DEL SERVICIO Y COTIZACIÓN\n"
                f"----------------------------------------\n"
                f"• Servicio: {service_name} (${rate_per_lb}/lb)\n"
                f"• Fecha de Recolección: {order.pickup_date}\n"
                f"• Horario de Recolección: {time_slot}\n"
                f"• Detalles / Add-ons: {order.order_details}\n"
                f"• Instrucciones Especiales: {instructions}\n"
                f"• Monto Base Estimado: ${base_price:.2f}\n"
                f"• Total Cotizado de la Solicitud: ${quoted_total:.2f} ($0.00 cobrado hoy)\n\n"
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
                  <span class="badge">SOLICITUD DE ORDEN #{order.id} RECIBIDA</span>
                  <p style="margin: 0 0 16px 0; font-size: 15px;">Hola <strong>{customer_name}</strong>, hemos recibido tu solicitud de recolección. Nuestro equipo confirmará tu orden a la brevedad.</p>
                  
                  <div class="section-title">📅 Horario y Servicio</div>
                  <table class="table-details">
                    <tr><td class="label">Fecha Programada:</td><td class="value">{order.pickup_date}</td></tr>
                    <tr><td class="label">Franja Horaria:</td><td class="value">{time_slot}</td></tr>
                    <tr><td class="label">Servicio:</td><td class="value">{service_name} (${rate_per_lb}/lb)</td></tr>
                    <tr><td class="label">Total Cotizado:</td><td class="value">${quoted_total:.2f} ($0.00 cobrado hoy)</td></tr>
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
                else f"${float(order.delivery_fee):.2f}"
            )
            zone_display = "Downtown Denver / Boulder Zone (FREE)" if order.delivery_zone == 'inner' else "Outer Metro Zone ($25 Fee)"
            instructions = order.pickup_instructions or 'None specified'
            subject = f"🔔 LaundryGo Order Request #{order.id}"

            text_content = (
                f"Thank you for your order request with LaundryGo!\n\n"
                f"ORDER REQUEST DETAILS #{order.id}\n"
                f"----------------------------------------\n"
                f"• Customer: {customer_name}\n"
                f"• Email: {customer_email or 'N/A'}\n"
                f"• Phone: {phone}\n"
                f"• Address: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Delivery Fee: {delivery_fee_str} ({zone_display})\n\n"
                f"SERVICE & QUOTE DETAILS\n"
                f"----------------------------------------\n"
                f"• Speed: {service_name} (${rate_per_lb}/lb)\n"
                f"• Pickup Date: {order.pickup_date}\n"
                f"• Pickup Window: {time_slot}\n"
                f"• Order Details / Add-ons: {order.order_details}\n"
                f"• Special Instructions: {instructions}\n"
                f"• Estimated Base Amount: ${base_price:.2f}\n"
                f"• Quoted Request Total: ${quoted_total:.2f} ($0.00 charged today)\n\n"
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
                  <span class="badge">ORDER REQUEST #{order.id} RECEIVED</span>
                  <p style="margin: 0 0 16px 0; font-size: 15px;">Hello <strong>{customer_name}</strong>, we have received your laundry pickup request. Our team will review and confirm your order shortly.</p>
                  
                  <div class="section-title">📅 Pickup Schedule &amp; Quote</div>
                  <table class="table-details">
                    <tr><td class="label">Scheduled Date:</td><td class="value">{order.pickup_date}</td></tr>
                    <tr><td class="label">Pickup Window:</td><td class="value">{time_slot}</td></tr>
                    <tr><td class="label">Service Speed:</td><td class="value">{service_name} (${rate_per_lb}/lb)</td></tr>
                    <tr><td class="label">Quoted Total:</td><td class="value">${quoted_total:.2f} ($0.00 charged today)</td></tr>
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
            kwargs={"reply_to": "info@thelaundrygo.com", "from_email": "LaundryGo <info@thelaundrygo.com>"},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing order confirmation email #{order.id}: {e}", exc_info=True)


def send_order_accepted_email(order, language=None):
    """
    Dispatches notification email to customer and copy to company when Admin accepts
    a LaundryGo order in the admin panel (status = 'confirmed').
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = (order.customer_name or "").strip() or "Valued Customer"
        service_name = order.service_rate.name if order.service_rate else "Standard"
        quoted_total = float(order.total_price or 40.00)
        recipients = _build_laundry_recipients(customer_email)

        lang = (language or getattr(order, 'language', None) or 'en').strip().lower()
        is_spanish = lang.startswith('es')

        if is_spanish:
            time_slot = (
                "Mañana (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Tarde (12:00 PM - 4:00 PM)"
            )
            subject = f"✅ Orden LaundryGo #{order.id} Aceptada y Confirmada"
            text_content = (
                f"¡Hola {customer_name}!\n\n"
                f"Tu solicitud de orden #{order.id} ha sido aceptada y confirmada por nuestro equipo operativo.\n\n"
                f"RESUMEN DE TU RECOLECCIÓN CONFIRMADA\n"
                f"----------------------------------------\n"
                f"• Orden: #{order.id} (Aceptada / Abierta)\n"
                f"• Servicio: {service_name}\n"
                f"• Fecha de Recolección: {order.pickup_date} ({time_slot})\n"
                f"• Dirección: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Monto Cotizado de la Solicitud: ${quoted_total:.2f}\n\n"
                f"Una vez pesado y completado el servicio, te enviaremos el detalle final de tu pedido y factura.\n\n"
                f"Equipo LaundryGo Denver • (720) 590-8632\n"
            )
            html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #bfdbfe;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">✅ ¡Orden #{order.id} Aceptada y Confirmada!</h1>
    </div>
    <div style="padding: 26px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
      <p>Hola <strong>{customer_name}</strong>,</p>
      <p>Tu orden <strong>#{order.id}</strong> ha sido revisada y aceptada por nuestro equipo. Tu recolección está programada para el <strong>{order.pickup_date} ({time_slot})</strong> en <strong>{order.street_address}, {order.city} {order.zip_code}</strong>.</p>
      <p><strong>Servicio:</strong> {service_name} &bull; <strong>Monto Cotizado:</strong> ${quoted_total:.2f}</p>
      <p>Al finalizar el servicio, te enviaremos el detalle final y factura de tu orden antes de la entrega.</p>
    </div>
  </div>
</body>
</html>"""
        else:
            time_slot = (
                "Morning (8:00 AM - 11:00 AM)"
                if order.pickup_time_slot == 'morning'
                else "Afternoon (12:00 PM - 4:00 PM)"
            )
            subject = f"✅ LaundryGo Order #{order.id} Accepted & Confirmed"
            text_content = (
                f"Hello {customer_name}!\n\n"
                f"Your order request #{order.id} has been accepted and confirmed by our operations team.\n\n"
                f"CONFIRMED PICKUP SUMMARY\n"
                f"----------------------------------------\n"
                f"• Order: #{order.id} (Accepted / Open)\n"
                f"• Service: {service_name}\n"
                f"• Pickup Date: {order.pickup_date} ({time_slot})\n"
                f"• Address: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Quoted Request Amount: ${quoted_total:.2f}\n\n"
                f"Once your laundry service is weighed and completed, we will send you the finalized order summary and invoice.\n\n"
                f"The LaundryGo Denver Team • (720) 590-8632\n"
            )
            html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #bfdbfe;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800;">✅ Order #{order.id} Accepted &amp; Confirmed!</h1>
    </div>
    <div style="padding: 26px 24px; color: #1e293b; font-size: 14px; line-height: 1.6;">
      <p>Hello <strong>{customer_name}</strong>,</p>
      <p>Your order <strong>#{order.id}</strong> has been reviewed and accepted by our team. Your pickup is confirmed for <strong>{order.pickup_date} ({time_slot})</strong> at <strong>{order.street_address}, {order.city} {order.zip_code}</strong>.</p>
      <p><strong>Service:</strong> {service_name} &bull; <strong>Quoted Amount:</strong> ${quoted_total:.2f}</p>
      <p>Once your service is completed, we will email you your finalized order breakdown and invoice before delivery.</p>
    </div>
  </div>
</body>
</html>"""

        threading.Thread(
            target=_send_mail_worker,
            args=(subject, text_content, html_content, recipients),
            kwargs={"reply_to": "info@thelaundrygo.com", "from_email": "LaundryGo <info@thelaundrygo.com>"},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing order accepted email #{order.id}: {e}", exc_info=True)


def send_order_cancellation_email(order, language=None):
    """
    Dispatches cancellation notification email to customer and admin,
    rendered in the customer's preferred language (English or Spanish).
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = (order.customer_name or "").strip() or "Valued Customer"
        service_name = order.service_rate.name if order.service_rate else "Standard"

        recipients = _build_laundry_recipients(customer_email)

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
            kwargs={"reply_to": "info@thelaundrygo.com", "from_email": "LaundryGo <info@thelaundrygo.com>"},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing cancellation email #{order.id}: {e}", exc_info=True)


def send_order_finalized_email(order, language=None):
    """
    Sends bilingual email notification with final order breakdown (quoted price + optional surcharge)
    and delivery coordination to the customer and a copy to the company upon closing the order.
    Decoupled from online payment gateways; payment is coordinated directly upon delivery.
    """
    try:
        customer_email = (order.customer_email or "").strip()
        customer_name = (order.customer_name or "").strip() or "Valued Customer"
        service_name = order.service_rate.name if order.service_rate else "Wash & Fold"

        delivery_fee = float(order.delivery_fee or 0)
        surcharge = float(order.surcharge_amount or 0)
        surcharge_concept = order.surcharge_concept or ""
        raw_base = float(order.base_price or 0)
        raw_total = float(order.total_price or 0)

        service_base = raw_base if raw_base > 0 else max(0.0, raw_total - delivery_fee)
        quoted_total = raw_total if raw_total > 0 else (service_base + delivery_fee)
        final_total = float(order.final_total_price or (quoted_total + surcharge))

        recipients = _build_laundry_recipients(customer_email)

        lang = (language or getattr(order, 'language', None) or 'en').strip().lower()
        is_spanish = lang.startswith('es')

        if is_spanish:
            subject = f"🔔 Tu Pedido LaundryGo #{order.id} está Listo - Detalle de tu Factura Final"
            fee_txt = f"• Tarifa de Entrega (Zona Exterior): +${delivery_fee:.2f}\n" if delivery_fee > 0 else ""
            surcharge_txt = f"• Sobrecargo / Ajuste: +${surcharge:.2f} ({surcharge_concept})\n" if surcharge > 0 else ""

            text_content = (
                f"¡Hola {customer_name}!\n\n"
                f"Tu ropa ha sido lavada, secada, doblada y pesada. Tu orden #{order.id} ha sido finalizada y está lista para entrega.\n\n"
                f"DESGLOSE DE TU PEDIDO\n"
                f"----------------------------------------\n"
                f"• Servicio: {service_name}\n"
                f"• Monto Base de Lavandería: ${service_base:.2f}\n"
                f"{fee_txt}"
                f"• Precio Cotizado de la Solicitud: ${quoted_total:.2f}\n"
                f"{surcharge_txt}"
                f"• TOTAL DEL SERVICIO: ${final_total:.2f}\n\n"
                f"Tu ropa está lista para ser entregada. El pago se efectúa directamente al momento de la entrega de tu ropa (o según los términos coordinados con nuestro equipo).\n\n"
                f"Si tienes alguna pregunta, puedes comunicarte con nosotros al (720) 590-8632 o responder a este correo.\n\n"
                f"¡Gracias por confiar en LaundryGo!\n"
                f"El Equipo de LaundryGo Denver\n"
            )

            fee_html = f"""<tr>
          <td style="color: #64748b; font-weight: 600;">Tarifa de Entrega (Zona Exterior):</td>
          <td style="color: #0f172a; font-weight: 600; text-align: right;">+${delivery_fee:.2f}</td>
        </tr>""" if delivery_fee > 0 else ""

            surcharge_html = f"""<tr>
          <td style="color: #b91c1c; font-weight: 600;">Ajuste / Sobrecargo ({surcharge_concept or 'Extra'}):</td>
          <td style="color: #b91c1c; font-weight: 700; text-align: right;">+${surcharge:.2f}</td>
        </tr>""" if surcharge > 0 else ""

            html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
  .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #bfdbfe; }}
  .header {{ background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff; }}
  .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; }}
  .content {{ padding: 28px 24px; }}
  .table-box {{ width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }}
  .table-box td {{ padding: 10px 14px; font-size: 14px; }}
  .banner-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; text-align: center; margin: 24px 0; }}
  .footer {{ background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧺 ¡Tu Ropa está Lista!</h1>
      <p style="margin: 6px 0 0; font-size: 14px; color: #dbeafe;">LaundryGo &bull; Orden Finalizada y Detalle de Factura</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hola <strong>{customer_name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Tu pedido <strong>#{order.id}</strong> ha sido completado y finalizado. A continuación puedes consultar el desglose total del servicio:
      </p>

      <table class="table-box">
        <tr>
          <td style="color: #64748b; font-weight: 600;">Servicio:</td>
          <td style="color: #0f172a; font-weight: 700; text-align: right;">{service_name}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 600;">Monto Base:</td>
          <td style="color: #0f172a; font-weight: 600; text-align: right;">${service_base:.2f}</td>
        </tr>
        {fee_html}
        <tr>
          <td style="color: #64748b; font-weight: 600;">Precio Cotizado de la Solicitud:</td>
          <td style="color: #0f172a; font-weight: 700; text-align: right;">${quoted_total:.2f}</td>
        </tr>
        {surcharge_html}
        <tr style="border-top: 2px solid #cbd5e1; background: #eff6ff;">
          <td style="color: #1e3a8a; font-size: 16px; font-weight: 800;">TOTAL DEL SERVICIO:</td>
          <td style="color: #1d4ed8; font-size: 18px; font-weight: 800; text-align: right;">${final_total:.2f}</td>
        </tr>
      </table>

      <div class="banner-box">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e40af;">🚚 Entrega en Camino y Pago Directo</p>
        <p style="margin: 6px 0 0; font-size: 13px; color: #2563eb;">Tu ropa limpia y doblada está lista para ser devuelta. El monto total de ${final_total:.2f} se liquida directamente al momento de la entrega.</p>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
        Si deseas coordinar detalles especiales de entrega, por favor contáctanos al (720) 590-8632.
      </p>
    </div>
    <div class="footer">
      LaundryGo Denver &bull; (720) 590-8632 &bull; <a href="mailto:info@thelaundrygo.com" style="color: #2563eb;">info@thelaundrygo.com</a>
    </div>
  </div>
</body>
</html>"""
        else:
            subject = f"🔔 Your LaundryGo Order #{order.id} is Ready - Final Order Details"
            fee_txt = f"• Delivery Fee (Outer Zone): +${delivery_fee:.2f}\n" if delivery_fee > 0 else ""
            surcharge_txt = f"• Surcharge / Weight Adjustment: +${surcharge:.2f} ({surcharge_concept})\n" if surcharge > 0 else ""

            text_content = (
                f"Hello {customer_name}!\n\n"
                f"Your laundry has been washed, dried, folded, and weighed. Your order #{order.id} is finalized and ready for delivery.\n\n"
                f"ORDER BREAKDOWN\n"
                f"----------------------------------------\n"
                f"• Service: {service_name}\n"
                f"• Base Laundry Amount: ${service_base:.2f}\n"
                f"{fee_txt}"
                f"• Quoted Request Price: ${quoted_total:.2f}\n"
                f"{surcharge_txt}"
                f"• TOTAL SERVICE AMOUNT: ${final_total:.2f}\n\n"
                f"Your laundry is ready for delivery. Payment is handled directly upon delivery of your laundry (or per terms arranged with our team).\n\n"
                f"If you have any questions, reach us at (720) 590-8632 or reply to this email.\n\n"
                f"Thank you for choosing LaundryGo!\n"
                f"The LaundryGo Team\n"
                f"Denver, Colorado • (720) 590-8632\n"
            )

            fee_html = f"""<tr>
          <td style="color: #64748b; font-weight: 600;">Outer Zone Delivery Fee:</td>
          <td style="color: #0f172a; font-weight: 600; text-align: right;">+${delivery_fee:.2f}</td>
        </tr>""" if delivery_fee > 0 else ""

            surcharge_html = f"""<tr>
          <td style="color: #b91c1c; font-weight: 600;">Adjustment / Surcharge ({surcharge_concept or 'Extra'}):</td>
          <td style="color: #b91c1c; font-weight: 700; text-align: right;">+${surcharge:.2f}</td>
        </tr>""" if surcharge > 0 else ""

            html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
  .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #bfdbfe; }}
  .header {{ background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff; }}
  .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; }}
  .content {{ padding: 28px 24px; }}
  .table-box {{ width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }}
  .table-box td {{ padding: 10px 14px; font-size: 14px; }}
  .banner-box {{ background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; text-align: center; margin: 24px 0; }}
  .footer {{ background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧺 Your Laundry is Ready!</h1>
      <p style="margin: 6px 0 0; font-size: 14px; color: #dbeafe;">LaundryGo &bull; Finalized Order &amp; Invoice</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hello <strong>{customer_name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">
        Your order <strong>#{order.id}</strong> has been completed and finalized. Below is your itemized order summary:
      </p>

      <table class="table-box">
        <tr>
          <td style="color: #64748b; font-weight: 600;">Service:</td>
          <td style="color: #0f172a; font-weight: 700; text-align: right;">{service_name}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 600;">Base Laundry:</td>
          <td style="color: #0f172a; font-weight: 600; text-align: right;">${service_base:.2f}</td>
        </tr>
        {fee_html}
        <tr>
          <td style="color: #64748b; font-weight: 600;">Quoted Request Price:</td>
          <td style="color: #0f172a; font-weight: 700; text-align: right;">${quoted_total:.2f}</td>
        </tr>
        {surcharge_html}
        <tr style="border-top: 2px solid #cbd5e1; background: #eff6ff;">
          <td style="color: #1e3a8a; font-size: 16px; font-weight: 800;">TOTAL DUE:</td>
          <td style="color: #1d4ed8; font-size: 18px; font-weight: 800; text-align: right;">${final_total:.2f}</td>
        </tr>
      </table>

      <div class="banner-box">
        <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e40af;">🚚 Out for Delivery • Direct Payment</p>
        <p style="margin: 6px 0 0; font-size: 13px; color: #2563eb;">Your clean, folded laundry is ready. Payment of ${final_total:.2f} is handled directly upon delivery.</p>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
        Need to coordinate delivery instructions? Feel free to contact us anytime at (720) 590-8632.
      </p>
    </div>
    <div class="footer">
      LaundryGo Denver &bull; (720) 590-8632 &bull; <a href="mailto:info@thelaundrygo.com" style="color: #2563eb;">info@thelaundrygo.com</a>
    </div>
  </div>
</body>
</html>"""

        threading.Thread(
            target=_send_mail_worker,
            args=(subject, text_content, html_content, recipients),
            kwargs={"reply_to": "info@thelaundrygo.com", "from_email": "LaundryGo <info@thelaundrygo.com>"},
            daemon=True,
        ).start()
    except Exception as e:
        logger.error(f"Error preparing finalized email #{order.id}: {e}", exc_info=True)


# Backward compatibility alias
send_laundry_payment_link_email = send_order_finalized_email
