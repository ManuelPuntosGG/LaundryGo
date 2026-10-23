import logging
import threading
from decimal import Decimal
from django.conf import settings
from apps.core.emails import send_mail_worker

logger = logging.getLogger(__name__)


def send_cleaning_order_confirmation_email(order, language=None):
    """
    Sends order confirmation email asynchronously for GoPropertyCare or Evolving Solutions LLC.
    Dispatches in Spanish if language == 'es' or order.language == 'es', else in English.
    Notifies both the customer and admin email.
    """
    order_id = order.id
    brand = getattr(order, 'brand', 'gopropertycare') or 'gopropertycare'
    is_evolving = brand == 'evolvingsolutions'

    company_name = "Evolving Solutions LLC" if is_evolving else "GoPropertyCare"
    company_email = "info@evolvingsolutionsllc.com" if is_evolving else "info@gopropertycare.com"
    tagline = (
        "Denver’s Trusted Partner for Commercial Cleaning & Industrial Labor"
        if is_evolving
        else "Premium Residential Cleaning • Denver & Boulder"
    )
    order_code = f"ESL-#{order_id}" if is_evolving else f"GPC-#{order_id}"
    header_bg = "#573725" if is_evolving else "#166534"
    accent_color = "#815133" if is_evolving else "#15803d"
    body_bg = "#fdfaf6" if is_evolving else "#f0fdf4"
    card_border = "#eedecd" if is_evolving else "#dcfce7"

    lang = language or getattr(order, 'language', 'en') or 'en'
    is_spanish = lang.lower().startswith('es')

    recipient_email = (order.user.email if order.user else None) or order.guest_email
    recipient_name = (
        f"{order.user.first_name} {order.user.last_name}".strip()
        if order.user and (order.user.first_name or order.user.last_name)
        else f"{order.guest_first_name} {order.guest_last_name}".strip()
    )
    if not recipient_name:
        recipient_name = recipient_email.split('@')[0] if recipient_email else 'Customer'

    service_name = order.service_rate.name
    date_str = order.service_date.strftime('%A, %B %d, %Y')
    time_slot_label = dict(order.TIME_SLOT_CHOICES).get(order.time_slot, order.time_slot)
    zone_label = dict(order.ZONE_CHOICES).get(order.delivery_zone, order.delivery_zone)
    sqft = order.square_feet
    street_address = order.street_address
    city = order.city
    zip_code = order.zip_code
    delivery_fee = order.delivery_fee
    total_price = order.total_price
    special_instructions = order.special_instructions
    selected_addons = list(order.selected_addons) if order.selected_addons else []
    frequency = getattr(order, 'frequency', '') or ''
    freq_map_es = {
        'weekly': 'Limpieza Semanal (20% Desc.)',
        'biweekly': 'Limpieza Quincenal (15% Desc.)',
        'monthly': 'Limpieza Mensual (10% Desc.)',
        'one_time': 'Servicio Único',
    }
    freq_map_en = {
        'weekly': 'Weekly Cleaning (20% OFF)',
        'biweekly': 'Bi-Weekly Cleaning (15% OFF)',
        'monthly': 'Monthly Cleaning (10% OFF)',
        'one_time': 'One-Time Clean',
    }
    freq_label = (freq_map_es if is_spanish else freq_map_en).get(frequency, '')

    def _send():
        try:
            # Format addons list
            addons_html = ""
            addons_text = ""
            if selected_addons:
                addons_html = "<ul style='margin: 8px 0; padding-left: 20px; color: #374151;'>"
                for addon in selected_addons:
                    name = addon.get('name') or addon.get('code', 'Add-on')
                    price = addon.get('price', 0)
                    addons_html += f"<li><strong>{name}</strong> (+${Decimal(str(price)):.2f})</li>"
                    addons_text += f"\n  - {name} (+${Decimal(str(price)):.2f})"
                addons_html += "</ul>"
            else:
                addons_html = "<p style='color: #6b7280; font-style: italic; margin: 4px 0;'>Ninguno / None</p>"
                addons_text = " None"

            if is_spanish:
                if is_evolving:
                    subject = f"{company_name} - Confirmación de Reserva de Servicio #{order_code}"
                    intro_p = f"Gracias por confiar en {company_name} para el cuidado y servicio de tu propiedad o instalación. Hemos recibido y registrado tu solicitud de servicio."
                    html_title = f"¡Tu Solicitud en {company_name} ha sido Registrada!"
                    html_intro = f"Hemos recibido tu pedido en {company_name}. Nuestro equipo profesional estará listo en la fecha y franja acordada."
                else:
                    subject = f"{company_name} - Solicitud de Reserva Recibida #{order_code}"
                    intro_p = f"¡Hemos recibido tu solicitud de reserva en {company_name}! Nuestro equipo verificará la disponibilidad de personal para la fecha seleccionada. Tu tarjeta ha quedado registrada con seguridad ($0.00 cobrado hoy); el depósito del 25% (${order.deposit_amount:.2f}) se procesará únicamente cuando tu reserva sea aceptada por nuestro equipo."
                    html_title = "¡Hemos Recibido tu Solicitud de Reserva!"
                    html_intro = f"Tu solicitud ha sido recibida con éxito. Verificaremos la disponibilidad de equipo en tu zona y confirmaremos tu cita en breve. Tu método de pago está resguardado con cifrado Stripe y no se realizará ningún cargo ($0.00 hoy) hasta que nuestro administrador confirme la cita."

                body_text = f"""¡Hola {recipient_name}!

{intro_p}

Detalles de tu Reserva:
=========================================
• Número de Orden: {order_code}
• Empresa: {company_name}
• Servicio: {service_name}
{f'• Frecuencia: {freq_label}\n' if freq_label else ''}• Superficie / Tamaño: {sqft} sq ft
• Fecha Solicitada: {date_str}
• Franja Horaria: {time_slot_label}
• Dirección: {street_address}, {city} {zip_code}
• Zona: {zone_label} (Recargo: ${delivery_fee:.2f})
• Recargos / Add-ons:{addons_text}
-----------------------------------------
• Total Estimado: ${total_price:.2f}
{f'• Depósito Inicial (25% al ser aceptada): ${order.deposit_amount:.2f}\n• Saldo Restante (75% al finalizar): ${order.remaining_balance:.2f}\n• Cobrado Hoy: $0.00\n' if not is_evolving else ''}=========================================

Instrucciones Especiales / Acceso:
{special_instructions or 'Ninguna especificada.'}

Nuestro equipo profesional llegará puntual en la franja acordada con todos los equipos e insumos necesarios bajo estrictos estándares de seguridad.

Si necesitas modificar tu cita, comunícate con nosotros al (720) 590-8632 o a {company_email}.

¡Gracias por elegir {company_name}!
El Equipo de {company_name}
Denver, Colorado
"""
                html_greeting = f"Hola {recipient_name},"
                lbl_order = "Número de Orden"
                lbl_service = "Servicio"
                lbl_freq = "Frecuencia"
                lbl_size = "Superficie de Trabajo"
                lbl_date = "Fecha Programada"
                lbl_slot = "Horario"
                lbl_address = "Dirección"
                lbl_addons = "Recargos Adicionales"
                lbl_total = "Total Estimado"
                lbl_notes = "Instrucciones de Acceso"
                lbl_footer = "¿Preguntas o cambios? Llámanos al (720) 590-8632."
            else:
                if is_evolving:
                    subject = f"{company_name} - Service Booking Confirmation #{order_code}"
                    intro_p = f"Thank you for choosing {company_name} for your facility care and project needs. We have received and registered your service request."
                    html_title = f"Your Booking with {company_name} is Registered!"
                    html_intro = f"We have received your service request. Our vetted, insured crew will arrive ready to deliver high standards for your project."
                else:
                    subject = f"{company_name} - Booking Request Received #{order_code}"
                    intro_p = f"We have received your booking request at {company_name}! Our operations team is verifying crew availability and will confirm your appointment shortly. Your card is safely on file ($0.00 charged today); your 25% deposit (${order.deposit_amount:.2f}) will only be processed once our team accepts and confirms your order."
                    html_title = "We Received Your Booking Request!"
                    html_intro = f"We have received your booking request. Our team is verifying crew availability for your requested date. Your card has been safely vaulted on file via Stripe encryption and no charge was made ($0.00 charged today) until our administrator confirms your appointment."

                body_text = f"""Hello {recipient_name}!

{intro_p}

Booking Details:
=========================================
• Order Number: {order_code}
• Company: {company_name}
• Service: {service_name}
{f'• Frequency: {freq_label}\n' if freq_label else ''}• Area / Size: {sqft} sq ft
• Requested Date: {date_str}
• Time Window: {time_slot_label}
• Address: {street_address}, {city} {zip_code}
• Zone: {zone_label} (Fee: ${delivery_fee:.2f})
• Add-ons & Surcharges:{addons_text}
-----------------------------------------
• Estimated Total: ${total_price:.2f}
{f'• Initial 25% Deposit (Upon Approval): ${order.deposit_amount:.2f}\n• Remaining 75% Balance (Upon Completion): ${order.remaining_balance:.2f}\n• Charged Today: $0.00\n' if not is_evolving else ''}=========================================

Access & Special Instructions:
{special_instructions or 'None provided.'}

Our professional team will arrive punctually during the selected window with all required commercial equipment and safety protocols.

Need changes? Contact us at (720) 590-8632 or {company_email}.

Thank you for trusting {company_name}!
The {company_name} Team
Denver, Colorado
"""
                html_greeting = f"Hello {recipient_name},"
                lbl_order = "Order Number"
                lbl_service = "Service Tier"
                lbl_freq = "Frecuencia" if is_spanish else "Frequency"
                lbl_size = "Work Area / Size"
                lbl_date = "Scheduled Date"
                lbl_slot = "Time Window"
                lbl_address = "Address"
                lbl_addons = "Add-ons / Surcharges"
                lbl_total = "Estimated Total"
                lbl_notes = "Access Instructions"
                lbl_footer = f"Questions or adjustments? Reach us at (720) 590-8632 or {company_email}."

            html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: {body_bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {body_bg}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid {card_border};">
          <!-- Header -->
          <tr>
            <td style="background-color: {header_bg}; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">{company_name}</h1>
              <p style="color: #f7efe6; margin: 8px 0 0; font-size: 13px; font-weight: 500;">{tagline}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: {accent_color}; font-size: 20px; font-weight: 700; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_greeting}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_intro}</p>

              <!-- Order Summary Card -->
              <table width="100%" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_order}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 15px; font-weight: 700; text-align: right;">{order_code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_service}</td>
                  <td style="padding: 8px 12px; color: {accent_color}; font-size: 14px; font-weight: 700; text-align: right;">{service_name}</td>
                </tr>
                {f'''<tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_freq}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{freq_label}</td>
                </tr>''' if freq_label else ''}
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_size}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{sqft} sq ft</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_date}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{date_str}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_slot}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{time_slot_label}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_address}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">{street_address}, {city} {zip_code}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 8px 12px;">
                    <div style="color: #64748b; font-size: 13px; font-weight: 600; margin-bottom: 4px;">{lbl_addons}:</div>
                    {addons_html}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                  <td style="padding: 12px; color: #0f172a; font-size: 16px; font-weight: 700;">{lbl_total}</td>
                  <td style="padding: 12px; color: {accent_color}; font-size: 18px; font-weight: 800; text-align: right;">${total_price:.2f}</td>
                </tr>
              </table>

              {f'''<div style="background-color: {body_bg}; border-left: 4px solid {accent_color}; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: {accent_color}; font-weight: 600;">{lbl_notes}:</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #374151;">{special_instructions}</p>
              </div>''' if special_instructions else ''}

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center; margin-top: 24px;">{lbl_footer}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 {company_name}. All rights reserved. Denver & Boulder, CO.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

            from_email = f"{company_name} <{company_email}>"
            admin_email = getattr(settings, 'ADMIN_EMAIL', company_email)
            recipients = []
            for addr in (recipient_email, company_email, admin_email):
                clean_addr = (addr or '').strip()
                if clean_addr and all(clean_addr.lower() != r.lower() for r in recipients):
                    recipients.append(clean_addr)

            if not recipients:
                logger.warning(f"[EMAIL SKIP] No recipient found for {order_code}")
                return

            send_mail_worker(
                subject=subject,
                text_content=body_text,
                html_content=html_content,
                recipients=recipients,
                reply_to=company_email,
                from_email=from_email,
            )
            logger.info(f"[EMAIL SUCCESS - {company_name}] Confirmation queued for {order_code} to {recipients}")

        except Exception as e:
            logger.error(f"[EMAIL FAILURE - {company_name}] Confirmation failed for {order_code}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_cleaning_order_cancellation_email(order, language=None):
    """
    Sends order cancellation email asynchronously for GoPropertyCare or Evolving Solutions LLC.
    """
    order_id = order.id
    brand = getattr(order, 'brand', 'gopropertycare') or 'gopropertycare'
    is_evolving = brand == 'evolvingsolutions'

    company_name = "Evolving Solutions LLC" if is_evolving else "GoPropertyCare"
    company_email = "info@evolvingsolutionsllc.com" if is_evolving else "info@gopropertycare.com"
    order_code = f"ESL-#{order_id}" if is_evolving else f"GPC-#{order_id}"

    lang = language or getattr(order, 'language', 'en') or 'en'
    is_spanish = lang.lower().startswith('es')
    service_date_str = str(order.service_date)
    service_name = getattr(order.service_rate, 'name', 'Service')

    recipient_email = (order.user.email if order.user else None) or order.guest_email
    recipient_name = (
        f"{order.user.first_name} {order.user.last_name}".strip()
        if order.user and (order.user.first_name or order.user.last_name)
        else f"{order.guest_first_name} {order.guest_last_name}".strip()
    )
    if not recipient_name:
        recipient_name = recipient_email.split('@')[0] if recipient_email else 'Customer'

    def _send():
        try:
            if is_spanish:
                subject = f"{company_name} - Cancelación de Reserva #{order_code}"
                body_text = f"""Hola {recipient_name},

Tu reserva de servicio #{order_code} ({service_name}) programada para {service_date_str} ha sido cancelada exitosamente.

Si no solicitaste esta cancelación o deseas reprogramar, por favor contáctanos al (720) 590-8632 o a {company_email}.

Atentamente,
El Equipo de {company_name}
"""
                html_title = f"Reserva #{order_code} Cancelada"
                html_p1 = f"Hola <strong>{recipient_name}</strong>,"
                html_p2 = f"Te confirmamos que tu reserva de servicio <strong>#{order_code}</strong> ({service_name}) programada para el <strong>{service_date_str}</strong> ha sido cancelada."
                html_p3 = f"Si deseas programar una nueva cita o consultar por otro proyecto, puedes hacerlo en cualquier momento en nuestra plataforma."
            else:
                subject = f"{company_name} - Booking Cancellation #{order_code}"
                body_text = f"""Hello {recipient_name},

Your service booking #{order_code} ({service_name}) scheduled for {service_date_str} has been cancelled successfully.

If you did not request this cancellation or would like to reschedule, please contact us at (720) 590-8632 or {company_email}.

Best regards,
The {company_name} Team
"""
                html_title = f"Booking #{order_code} Cancelled"
                html_p1 = f"Hello <strong>{recipient_name}</strong>,"
                html_p2 = f"We confirm that your booking <strong>#{order_code}</strong> ({service_name}) scheduled for <strong>{service_date_str}</strong> has been cancelled."
                html_p3 = f"If you'd like to book a new appointment or discuss site support, reach out to us anytime."

            html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #dc2626; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">{company_name}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #dc2626; font-size: 18px; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p1}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p2}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p3}</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Questions? Reach us at (720) 590-8632 or <a href="mailto:{company_email}" style="color: #2563eb;">{company_email}</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

            from_email = f"{company_name} <{company_email}>"
            admin_email = getattr(settings, 'ADMIN_EMAIL', company_email)
            recipients = []
            for addr in (recipient_email, company_email, admin_email):
                clean_addr = (addr or '').strip()
                if clean_addr and all(clean_addr.lower() != r.lower() for r in recipients):
                    recipients.append(clean_addr)

            if not recipients:
                return

            send_mail_worker(
                subject=subject,
                text_content=body_text,
                html_content=html_content,
                recipients=recipients,
                reply_to=company_email,
                from_email=from_email,
            )
            logger.info(f"[EMAIL SUCCESS - {company_name}] Cancellation queued for {order_code} to {recipients}")

        except Exception as e:
            logger.error(f"[EMAIL FAILURE - {company_name}] Cancellation failed for {order_code}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_commercial_walkthrough_inquiry_email(data):
    """
    Asynchronously sends commercial walkthrough inquiry notification to the company email
    (info@gopropertycare.com) and a confirmation email to the prospect.
    """
    def _send():
        try:
            name = data.get('name', '').strip()
            phone = data.get('phone', '').strip()
            email = data.get('email', '').strip()
            zip_code = data.get('zip_code', '').strip()
            details = data.get('details', '').strip()
            language = data.get('language', 'en') or 'en'
            is_spanish = str(language).lower().startswith('es')

            company_name = "GoPropertyCare"
            company_email = "info@gopropertycare.com"
            admin_email = getattr(settings, 'ADMIN_EMAIL', company_email)
            from_email = f"{company_name} <{company_email}>"

            # 1. Email to Company (admin)
            admin_subject = f"[New Commercial Walkthrough Inquiry] {name} - ZIP {zip_code}"
            admin_text = f"""New Commercial Cleaning Walkthrough Inquiry:

Client Name: {name}
Phone: {phone}
Email: {email}
ZIP Code: {zip_code}
Details / Requirements:
{details}

This inquiry was submitted via the GoPropertyCare website.
Please contact the customer to confirm the 15-minute walkthrough.
"""
            admin_html = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #dcfce7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background: #166534; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">GoPropertyCare • Commercial Walkthrough</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #bbf7d0;">New Inquiry Received from Website</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px; color: #1e293b;">
            <tr>
              <td style="font-weight: bold; width: 130px; color: #64748b;">Client Name:</td>
              <td style="font-weight: 800; color: #0f172a;">{name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748b;">Phone:</td>
              <td><a href="tel:{phone}" style="color: #15803d; font-weight: bold; text-decoration: none;">{phone}</a></td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748b;">Email:</td>
              <td><a href="mailto:{email}" style="color: #15803d; font-weight: bold; text-decoration: none;">{email}</a></td>
            </tr>
            <tr>
              <td style="font-weight: bold; color: #64748b;">ZIP Code:</td>
              <td style="font-weight: bold; color: #0f172a;">{zip_code}</td>
            </tr>
          </table>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Business Space & Requirements:</h3>
        <div style="background: #ffffff; border-left: 4px solid #16a34a; padding: 12px 16px; font-size: 14px; color: #334155; line-height: 1.6; background-color: #f0fdf4; border-radius: 0 8px 8px 0;">
          {details}
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;">
          A notification has also been sent to the client to confirm receipt.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>"""

            send_mail_worker(
                subject=admin_subject,
                text_content=admin_text,
                html_content=admin_html,
                recipients=[admin_email, company_email],
                reply_to=email,
                from_email=from_email,
            )

            # 2. Confirmation email to the Prospect
            if email:
                if is_spanish:
                    client_subject = "Hemos recibido tu solicitud de Walkthrough Comercial | GoPropertyCare"
                    client_text = f"""Hola {name},

Gracias por contactar a GoPropertyCare. Hemos recibido tu solicitud para una visita de evaluacion presencial (Walkthrough) de 15 minutos para tu espacio comercial.

Datos recibidos:
- Nombre: {name}
- Telefono: {phone}
- Codigo Postal: {zip_code}
- Detalles: {details}

Un asesor de nuestro equipo comercial se comunicara contigo el mismo dia habil para coordinar la fecha y hora de la visita de 15 minutos y entregarte una propuesta personalizada y por escrito sin ningun costo ni compromiso ($0.00 anticipo).

Atentamente,
Equipo de GoPropertyCare
Telefono: (720) 590-8632
Email: info@gopropertycare.com
"""
                    client_html = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #dcfce7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background: #166534; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">GoPropertyCare</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #bbf7d0;">Solicitud de Walkthrough Comercial Recibida</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hola <strong>{name}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          ¡Gracias por tu interes en nuestros servicios de limpieza comercial! Hemos recibido tus datos y requerimientos.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">Resumen de tu solicitud:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Telefono:</strong> {phone}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Codigo Postal:</strong> {zip_code}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Detalles:</strong> {details}</p>
        </div>
        <p style="font-size: 14px; color: #15803d; font-weight: bold; line-height: 1.6;">
          ¿Que sigue ahora?
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          Un asesor de nuestro equipo comercial se comunicara contigo el mismo dia habil para coordinar la visita de 15 minutos en tus instalaciones y entregarte un presupuesto por escrito a tu medida con <strong>$0.00 anticipo</strong> y sin ningun compromiso.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
          GoPropertyCare • (720) 590-8632 • info@gopropertycare.com • Denver Metropolitan Area & Boulder, CO
        </div>
      </td>
    </tr>
  </table>
</body>
</html>"""
                else:
                    client_subject = "We Received Your Commercial Walkthrough Request | GoPropertyCare"
                    client_text = f"""Hello {name},

Thank you for reaching out to GoPropertyCare. We have received your request for a 15-minute on-site assessment (Walkthrough) for your commercial space.

Inquiry details:
- Name: {name}
- Phone: {phone}
- ZIP Code: {zip_code}
- Details: {details}

A commercial account manager from our team will contact you within the same business day to coordinate the 15-minute visit and deliver your custom written proposal with zero obligation ($0.00 upfront).

Best regards,
GoPropertyCare Team
Phone: (720) 590-8632
Email: info@gopropertycare.com
"""
                    client_html = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0fdf4; margin: 0; padding: 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #dcfce7; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="background: #166534; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">GoPropertyCare</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #bbf7d0;">Commercial Walkthrough Request Received</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hello <strong>{name}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Thank you for your interest in GoPropertyCare! We have received your facility details and commercial cleaning requirements.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">Summary of your request:</h4>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Phone:</strong> {phone}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>ZIP Code:</strong> {zip_code}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Details:</strong> {details}</p>
        </div>
        <p style="font-size: 14px; color: #15803d; font-weight: bold; line-height: 1.6;">
          What happens next?
        </p>
        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
          A dedicated commercial account manager will reach out within the same business day to schedule your 15-minute walkthrough and provide an itemized written proposal with <strong>$0.00 upfront</strong> and zero obligation.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
          GoPropertyCare • (720) 590-8632 • info@gopropertycare.com • Denver Metropolitan Area & Boulder, CO
        </div>
      </td>
    </tr>
  </table>
</body>
</html>"""

                send_mail_worker(
                    subject=client_subject,
                    text_content=client_text,
                    html_content=client_html,
                    recipients=[email],
                    reply_to=company_email,
                    from_email=from_email,
                )

            logger.info(f"[EMAIL SUCCESS - GoPropertyCare] Commercial walkthrough inquiry emails sent for {name} ({email})")
        except Exception as e:
            logger.error(f"[EMAIL FAILURE - GoPropertyCare] Commercial walkthrough inquiry email failed: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_cleaning_final_charge_email(order):
    """
    Sends bilingual completion & final payment receipt email for GoPropertyCare
    to the customer and a copy to the company, itemizing the service details,
    quoted request price, optional surcharge, total service amount (quoted + surcharges),
    initial 25% deposit, and remaining 75% + surcharge automatically charged via Stripe.
    """
    order_id = order.id
    order_code = f"GPC-#{order_id}"
    company_name = "GoPropertyCare"
    company_email = "info@gopropertycare.com"
    header_bg = "#166534"
    accent_color = "#15803d"
    body_bg = "#f0fdf4"
    card_border = "#dcfce7"

    lang = getattr(order, 'language', 'en') or 'en'
    is_spanish = str(lang).lower().startswith('es')

    recipient_email = (order.user.email if order.user else None) or order.guest_email
    recipient_name = (
        f"{order.user.first_name} {order.user.last_name}".strip()
        if order.user and (order.user.first_name or order.user.last_name)
        else f"{order.guest_first_name} {order.guest_last_name}".strip()
    )
    if not recipient_name:
        recipient_name = recipient_email.split('@')[0] if recipient_email else 'Customer'

    service_name = order.service_rate.name
    date_str = order.service_date.strftime('%A, %B %d, %Y')
    quoted_price = order.total_price or Decimal('0.00')
    deposit = order.deposit_amount or Decimal('0.00')
    remaining = order.remaining_balance or Decimal('0.00')
    surcharge = order.surcharge_amount or Decimal('0.00')
    surcharge_concept = order.surcharge_concept or ''
    charged_today = remaining + surcharge
    total_charged = order.final_total_charged or (quoted_price + surcharge)
    address_str = f"{order.street_address}, {order.city} {order.zip_code}".strip(', ')

    def _send():
        try:
            if is_spanish:
                subject = f"GoPropertyCare - Orden Cerrada y Recibo de Servicio #{order_code}"
                body_text = f"""¡Hola {recipient_name}!

Tu servicio de limpieza con GoPropertyCare ha sido finalizado y cerrado con éxito.
Hemos procesado automáticamente vía Stripe el cobro del saldo restante (75% + sobrecargos, si aplica) a la tarjeta registrada en tu cuenta.

Detalle del Servicio y Monto Total:
=========================================
• Número de Orden: {order_code}
• Servicio Realizado: {service_name} ({order.square_feet} sq ft)
• Fecha Realizada: {date_str}
• Ubicación: {address_str}
-----------------------------------------
• Precio Cotizado de la Solicitud: ${quoted_price:.2f}
{f'• Sobrecargo / Ajuste: +${surcharge:.2f} ({surcharge_concept})\n' if surcharge > 0 else ''}• MONTO TOTAL DEL SERVICIO (Cotizado + Sobrecargos): ${total_charged:.2f}
-----------------------------------------
Desglose de Pagos vía Stripe:
• Depósito Inicial (25% Pagado al Aceptar Orden): ${deposit:.2f}
• Cobro Final Automático (75% Restante{f' + Sobrecargo' if surcharge > 0 else ''}): ${charged_today:.2f}
• Estado de la Orden: Cerrada y Finalizada (Pagado Totalmente)
=========================================

¡Agradecemos tu confianza en GoPropertyCare! Si tienes alguna duda sobre tu recibo, comunícate con nosotros al (720) 590-8632 o a {company_email}.

Atentamente,
El Equipo de GoPropertyCare
Denver & Boulder, Colorado
"""
                html_title = "¡Tu Servicio ha sido Finalizado y Cerrado!"
                html_greeting = f"Hola {recipient_name},"
                html_intro = "Tu servicio ha culminado satisfactoriamente. A continuación encontrarás el detalle del servicio, el monto total (precio cotizado + sobrecargos) y el desglose del cobro procesado automáticamente vía Stripe."
                lbl_quoted = "Precio Cotizado de la Solicitud"
                lbl_surcharge = "Sobrecargo / Ajuste"
                lbl_total = "MONTO TOTAL DEL SERVICIO"
                lbl_deposit = "Depósito Inicial (25% ya pagado)"
                lbl_charged_today = "Cobro Final hoy vía Stripe (75% + Sobrecargos)"
                lbl_status = "Estado de la Orden"
                status_val = "Cerrada y Finalizada • Pagado 100%"
            else:
                subject = f"GoPropertyCare - Order Closed & Final Service Receipt #{order_code}"
                body_text = f"""Hello {recipient_name}!

Your cleaning service with GoPropertyCare has been completed and finalized.
We have automatically processed the remaining balance (75% + any applicable surcharges) via Stripe to the card saved on your account.

Service Details & Total Breakdown:
=========================================
• Order Number: {order_code}
• Service Performed: {service_name} ({order.square_feet} sq ft)
• Date Completed: {date_str}
• Property Address: {address_str}
-----------------------------------------
• Quoted Request Price: ${quoted_price:.2f}
{f'• Surcharge / Adjustment: +${surcharge:.2f} ({surcharge_concept})\n' if surcharge > 0 else ''}• TOTAL SERVICE AMOUNT (Quoted + Surcharges): ${total_charged:.2f}
-----------------------------------------
Stripe Payment Breakdown:
• Initial Deposit (25% Paid Upon Acceptance): ${deposit:.2f}
• Final Automatic Charge (Remaining 75%{f' + Surcharge' if surcharge > 0 else ''}): ${charged_today:.2f}
• Order Status: Closed & Finalized (Fully Paid)
=========================================

Thank you for choosing GoPropertyCare! If you have any questions regarding your receipt, contact us at (720) 590-8632 or {company_email}.

Best regards,
The GoPropertyCare Team
Denver & Boulder, Colorado
"""
                html_title = "Your Cleaning Service is Complete & Finalized!"
                html_greeting = f"Hello {recipient_name},"
                html_intro = "Your service has been completed to our highest standards. Below is your service detail, total service amount (quoted price + surcharges), and the automatic Stripe payment receipt."
                lbl_quoted = "Quoted Request Price"
                lbl_surcharge = "Surcharge / Adjustment"
                lbl_total = "TOTAL SERVICE AMOUNT"
                lbl_deposit = "Initial Deposit (25% Previously Paid)"
                lbl_charged_today = "Final Stripe Charge Today (75% + Surcharges)"
                lbl_status = "Order Status"
                status_val = "Closed & Finalized • 100% Paid"

            surcharge_row = ""
            if surcharge > 0:
                concept_display = f" ({surcharge_concept})" if surcharge_concept else ""
                surcharge_row = f"""<tr>
                  <td style="padding: 8px 12px; color: #dc2626; font-size: 13px; font-weight: 600;">{lbl_surcharge}{concept_display}</td>
                  <td style="padding: 8px 12px; color: #dc2626; font-size: 14px; font-weight: 700; text-align: right;">+${surcharge:.2f}</td>
                </tr>"""

            html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head><meta charset="utf-8"><title>{subject}</title></head>
<body style="margin: 0; padding: 0; background-color: {body_bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {body_bg}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid {card_border};">
          <tr>
            <td style="background-color: {header_bg}; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">{company_name}</h1>
              <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 13px; font-weight: 500;">Service Completion &amp; Final Payment Receipt</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: {accent_color}; font-size: 20px; font-weight: 700; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_greeting}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_intro}</p>

              <table width="100%" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">Order</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 15px; font-weight: 700; text-align: right;">{order_code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">Service</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{service_name} ({order.square_feet} sq ft)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">Address</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 13px; font-weight: 500; text-align: right;">{address_str}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_quoted}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${quoted_price:.2f}</td>
                </tr>
                {surcharge_row}
                <tr style="border-top: 2px solid #cbd5e1; background-color: #f0fdf4;">
                  <td style="padding: 12px; color: #0f172a; font-size: 15px; font-weight: 800;">{lbl_total}</td>
                  <td style="padding: 12px; color: {accent_color}; font-size: 18px; font-weight: 800; text-align: right;">${total_charged:.2f}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 12px; font-weight: 600;">{lbl_deposit}</td>
                  <td style="padding: 8px 12px; color: #475569; font-size: 13px; font-weight: 600; text-align: right;">${deposit:.2f}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #166534; font-size: 13px; font-weight: 700;">{lbl_charged_today}</td>
                  <td style="padding: 8px 12px; color: #166534; font-size: 14px; font-weight: 800; text-align: right;">${charged_today:.2f}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 12px;">{lbl_status}</td>
                  <td style="padding: 8px 12px; color: #166534; font-size: 12px; font-weight: 700; text-align: right;">{status_val}</td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center; margin-top: 24px;">
                Questions about your charge? Reach us at (720) 590-8632 or {company_email}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 {company_name}. All rights reserved. Denver &amp; Boulder, CO.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

            from_email = f"{company_name} <{company_email}>"
            admin_email = getattr(settings, 'ADMIN_EMAIL', company_email)
            recipients = []
            for addr in (recipient_email, company_email, admin_email):
                clean_addr = (addr or '').strip()
                if clean_addr and all(clean_addr.lower() != r.lower() for r in recipients):
                    recipients.append(clean_addr)

            if recipients:
                send_mail_worker(
                    subject=subject,
                    text_content=body_text,
                    html_content=html_content,
                    recipients=recipients,
                    reply_to=company_email,
                    from_email=from_email,
                )
                logger.info(f"[EMAIL SUCCESS - GoPropertyCare] Final receipt email sent for {order_code} to {recipients}")
        except Exception as e:
            logger.error(f"[EMAIL FAILURE - GoPropertyCare] Final receipt email failed for {order_code}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_cleaning_deposit_charged_email(order):
    """
    Sends bilingual confirmation email when Admin accepts a GoPropertyCare booking in Django Unfold,
    notifying the customer that their appointment is officially confirmed and the 25% deposit has been processed.
    """
    order_id = order.id
    order_code = f"GPC-#{order_id}"
    company_name = "GoPropertyCare"
    company_email = "info@gopropertycare.com"
    header_bg = "#166534"
    accent_color = "#15803d"
    body_bg = "#f0fdf4"
    card_border = "#dcfce7"

    lang = getattr(order, 'language', 'en') or 'en'
    is_spanish = str(lang).lower().startswith('es')

    recipient_email = (order.user.email if order.user else None) or order.guest_email
    recipient_name = (
        f"{order.user.first_name} {order.user.last_name}".strip()
        if order.user and (order.user.first_name or order.user.last_name)
        else f"{order.guest_first_name} {order.guest_last_name}".strip()
    )
    if not recipient_name:
        recipient_name = recipient_email.split('@')[0] if recipient_email else 'Customer'

    service_name = order.service_rate.name
    date_str = order.service_date.strftime('%A, %B %d, %Y')
    time_slot_label = dict(order.TIME_SLOT_CHOICES).get(order.time_slot, order.time_slot)
    deposit = order.deposit_amount or Decimal('0.00')
    remaining = order.remaining_balance or Decimal('0.00')
    total = order.total_price or Decimal('0.00')

    def _send():
        try:
            if is_spanish:
                subject = f"GoPropertyCare - ¡Reserva Aceptada y Confirmada! #{order_code}"
                body_text = f"""¡Hola {recipient_name}!

¡Excelentes noticias! Tu reserva con GoPropertyCare ha sido aceptada y confirmada por nuestro equipo operativo.

Hemos procesado con éxito el depósito inicial del 25% a la tarjeta registrada en tu cuenta para asegurar tu llegada en la fecha y franja acordada.

Detalles de tu Cita Confirmada:
=========================================
• Número de Orden: {order_code}
• Servicio: {service_name}
• Fecha Confirmada: {date_str}
• Horario de Llegada: {time_slot_label}
• Dirección: {order.street_address}, {order.city} {order.zip_code}
-----------------------------------------
• Total Estimado del Servicio: ${total:.2f}
• Depósito del 25% (Cobrado Hoy): ${deposit:.2f}
• Saldo Restante del 75% (Al Finalizar): ${remaining:.2f}
• Estado del Pago: Depósito Pagado (25%)
=========================================

Nuestro equipo llegará puntual con todos los suministros y equipos profesionales necesarios.

Si necesitas hacer algún ajuste a tu cita, comunícate con nosotros al (720) 590-8632 o a {company_email}.

¡Gracias por elegir GoPropertyCare!
El Equipo de GoPropertyCare
Denver & Boulder, Colorado
"""
                html_title = "¡Tu Reserva ha sido Aceptada y Confirmada!"
                html_greeting = f"Hola {recipient_name},"
                html_intro = "¡Buenas noticias! Nuestro equipo operativo ha revisado y aceptado tu solicitud de servicio. Hemos procesado el depósito inicial del 25% a tu tarjeta registrada y tu cita está 100% asegurada en nuestro calendario."
                lbl_order = "Número de Orden"
                lbl_service = "Servicio"
                lbl_freq = "Frecuencia"
                lbl_date = "Fecha Confirmada"
                lbl_slot = "Horario de Llegada"
                lbl_address = "Dirección"
                lbl_total = "Total Estimado"
                lbl_deposit = "Depósito Inicial (25% Pagado Hoy)"
                lbl_remaining = "Saldo Restante (75% al Finalizar)"
                lbl_status = "Estado"
                status_val = "Confirmada • Depósito 25% Pagado"
            else:
                subject = f"GoPropertyCare - Booking Accepted & Confirmed! #{order_code}"
                body_text = f"""Hello {recipient_name}!

Great news! Your booking with GoPropertyCare has been reviewed and accepted by our operations team.

We have successfully processed the 25% initial deposit to your card on file to lock in your appointment on our schedule.

Confirmed Appointment Details:
=========================================
• Order Number: {order_code}
• Service: {service_name}
• Confirmed Date: {date_str}
• Arrival Window: {time_slot_label}
• Address: {order.street_address}, {order.city} {order.zip_code}
-----------------------------------------
• Total Estimated Service Quote: ${total:.2f}
• Initial 25% Deposit (Charged Today): ${deposit:.2f}
• Remaining 75% Balance (Upon Completion): ${remaining:.2f}
• Payment Status: Deposit Paid (25%)
=========================================

Our insured professional crew will arrive punctually with all required supplies and equipment.

Need any changes? Reach us at (720) 590-8632 or {company_email}.

Thank you for choosing GoPropertyCare!
The GoPropertyCare Team
Denver & Boulder, Colorado
"""
                html_title = "Your Booking is Accepted & Confirmed!"
                html_greeting = f"Hello {recipient_name},"
                html_intro = "Great news! Our operations team has reviewed and accepted your service booking. We have successfully processed your initial 25% deposit to your card on file, securing your arrival window."
                lbl_order = "Order Number"
                lbl_service = "Service Tier"
                lbl_date = "Confirmed Date"
                lbl_slot = "Arrival Window"
                lbl_address = "Address"
                lbl_total = "Estimated Quote"
                lbl_deposit = "Initial Deposit (25% Charged Today)"
                lbl_remaining = "Remaining Balance (75% Upon Completion)"
                lbl_status = "Status"
                status_val = "Confirmed • 25% Deposit Paid"

            html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: {body_bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: {body_bg}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid {card_border};">
          <tr>
            <td style="background-color: {header_bg}; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">{company_name}</h1>
              <p style="color: #f7efe6; margin: 8px 0 0; font-size: 13px; font-weight: 500;">Premium Residential Cleaning • Denver &amp; Boulder</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: {accent_color}; font-size: 20px; font-weight: 700; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_greeting}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_intro}</p>

              <table width="100%" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_order}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 15px; font-weight: 700; text-align: right;">{order_code}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_service}</td>
                  <td style="padding: 8px 12px; color: {accent_color}; font-size: 14px; font-weight: 700; text-align: right;">{service_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_date}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{date_str}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_slot}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">{time_slot_label}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_address}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 500; text-align: right;">{order.street_address}, {order.city} {order.zip_code}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_total}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${total:.2f}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #166534; font-size: 13px; font-weight: 700;">{lbl_deposit}</td>
                  <td style="padding: 8px 12px; color: #166534; font-size: 15px; font-weight: 800; text-align: right;">${deposit:.2f}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_remaining}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">${remaining:.2f}</td>
                </tr>
                <tr style="border-top: 1px solid #cbd5e1;">
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 13px; font-weight: 700;">{lbl_status}</td>
                  <td style="padding: 8px 12px; color: #166534; font-size: 12px; font-weight: 700; text-align: right;">{status_val}</td>
                </tr>
              </table>

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center; margin-top: 24px;">
                Questions or adjustments? Reach us at (720) 590-8632 or {company_email}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 {company_name}. All rights reserved. Denver &amp; Boulder, CO.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

            from_email = f"{company_name} <{company_email}>"
            admin_email = getattr(settings, 'ADMIN_EMAIL', company_email)
            recipients = []
            for addr in (recipient_email, company_email, admin_email):
                clean_addr = (addr or '').strip()
                if clean_addr and all(clean_addr.lower() != r.lower() for r in recipients):
                    recipients.append(clean_addr)

            if recipients:
                send_mail_worker(
                    subject=subject,
                    text_content=body_text,
                    html_content=html_content,
                    recipients=recipients,
                    reply_to=company_email,
                    from_email=from_email,
                )
                logger.info(f"[EMAIL SUCCESS - GoPropertyCare] Deposit charged confirmation email sent for {order_code} to {recipients}")
        except Exception as e:
            logger.error(f"[EMAIL FAILURE - GoPropertyCare] Deposit charged email failed for {order_code}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()

