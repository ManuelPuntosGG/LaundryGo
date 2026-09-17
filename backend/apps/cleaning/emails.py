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
                subject = f"{company_name} - Confirmación de Reserva de Servicio #{order_code}"
                body_text = f"""¡Hola {recipient_name}!

Gracias por confiar en {company_name} para el cuidado y servicio de tu propiedad o instalación. Hemos recibido y confirmado tu solicitud de servicio.

Detalles de tu Reserva:
=========================================
• Número de Orden: {order_code}
• Empresa: {company_name}
• Servicio: {service_name}
• Superficie / Tamaño: {sqft} sq ft
• Fecha del Servicio: {date_str}
• Franja Horaria: {time_slot_label}
• Dirección: {street_address}, {city} {zip_code}
• Zona: {zone_label} (Recargo: ${delivery_fee:.2f})
• Recargos / Add-ons:{addons_text}
• Total Estimado: ${total_price:.2f}
=========================================

Instrucciones Especiales / Acceso:
{special_instructions or 'Ninguna especificada.'}

Nuestro equipo profesional llegará puntual en la franja acordada con todos los equipos e insumos necesarios bajo estrictos estándares de seguridad.

Si necesitas modificar tu cita, comunícate con nosotros al (720) 590-8632 o a {company_email}.

¡Gracias por elegir {company_name}!
El Equipo de {company_name}
Denver, Colorado
"""
                html_title = f"¡Tu Reserva en {company_name} ha sido Confirmada!"
                html_greeting = f"Hola {recipient_name},"
                html_intro = f"Hemos recibido tu pedido en {company_name}. Nuestro equipo profesional estará listo en la fecha y franja acordada."
                lbl_order = "Número de Orden"
                lbl_service = "Servicio"
                lbl_size = "Superficie de Trabajo"
                lbl_date = "Fecha Programada"
                lbl_slot = "Horario"
                lbl_address = "Dirección"
                lbl_addons = "Recargos Adicionales"
                lbl_total = "Total Estimado"
                lbl_notes = "Instrucciones de Acceso"
                lbl_footer = "¿Preguntas o cambios? Llámanos al (720) 590-8632."
            else:
                subject = f"{company_name} - Service Booking Confirmation #{order_code}"
                body_text = f"""Hello {recipient_name}!

Thank you for choosing {company_name} for your facility care and project needs. We have received and confirmed your service request.

Booking Details:
=========================================
• Order Number: {order_code}
• Company: {company_name}
• Service: {service_name}
• Area / Size: {sqft} sq ft
• Scheduled Date: {date_str}
• Time Window: {time_slot_label}
• Address: {street_address}, {city} {zip_code}
• Zone: {zone_label} (Fee: ${delivery_fee:.2f})
• Add-ons & Surcharges:{addons_text}
• Estimated Total: ${total_price:.2f}
=========================================

Access & Special Instructions:
{special_instructions or 'None provided.'}

Our professional team will arrive punctually during the selected window with all required commercial equipment and safety protocols.

Need changes? Contact us at (720) 590-8632 or {company_email}.

Thank you for trusting {company_name}!
The {company_name} Team
Denver, Colorado
"""
                html_title = f"Your Booking with {company_name} is Confirmed!"
                html_greeting = f"Hello {recipient_name},"
                html_intro = f"We have received your service request. Our vetted, insured crew will arrive ready to deliver high standards for your project."
                lbl_order = "Order Number"
                lbl_service = "Service Tier"
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
            recipients = [recipient_email] if recipient_email else []
            if admin_email and admin_email not in recipients:
                recipients.append(admin_email)

            if not recipients:
                logger.warning(f"[EMAIL SKIP] No recipient found for {order_code}")
                return

            send_mail_worker(
                subject=subject,
                text_content=body_text,
                html_content=html_content,
                recipients=recipients,
                reply_to=admin_email,
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
            recipients = [recipient_email] if recipient_email else []
            if admin_email and admin_email not in recipients:
                recipients.append(admin_email)

            if not recipients:
                return

            send_mail_worker(
                subject=subject,
                text_content=body_text,
                html_content=html_content,
                recipients=recipients,
                reply_to=admin_email,
                from_email=from_email,
            )
            logger.info(f"[EMAIL SUCCESS - {company_name}] Cancellation queued for {order_code} to {recipients}")

        except Exception as e:
            logger.error(f"[EMAIL FAILURE - {company_name}] Cancellation failed for {order_code}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
