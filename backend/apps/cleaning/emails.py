import logging
import threading
from decimal import Decimal
from django.conf import settings
from apps.core.emails import send_mail_worker

logger = logging.getLogger(__name__)


def send_cleaning_order_confirmation_email(order, language=None):
    """
    Sends order confirmation email asynchronously for GoPropertyCare.
    Dispatches in Spanish if language == 'es' or order.language == 'es', else in English.
    Notifies both the customer and admin email.
    """
    order_id = order.id
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
                subject = f"GoPropertyCare - Confirmación de Reserva de Limpieza #{order_id}"
                body_text = f"""¡Hola {recipient_name}!

Gracias por confiar en GoPropertyCare para el cuidado y limpieza de tu propiedad. Hemos recibido y confirmado tu solicitud de servicio.

Detalles de tu Reserva:
=========================================
• Número de Orden: #{order_id}
• Servicio: {service_name}
• Tamaño de Propiedad: {sqft} sq ft
• Fecha del Servicio: {date_str}
• Franja Horaria: {time_slot_label}
• Dirección: {street_address}, {city} {zip_code}
• Zona: {zone_label} (Recargo: ${delivery_fee:.2f})
• Recargos / Add-ons:{addons_text}
• Total Estimado: ${total_price:.2f}
=========================================

Instrucciones Especiales / Acceso:
{special_instructions or 'Ninguna especificada.'}

Nuestro equipo profesional llegará puntual en la franja acordada con todos los insumos y equipos necesarios.

Si necesitas modificar tu cita, comunícate con nosotros al (720) 590-8632 o a info@gopropertycare.com.

¡Gracias por elegir GoPropertyCare!
El Equipo de GoPropertyCare
Denver, Colorado
"""
                html_title = "¡Tu Reserva de Limpieza ha sido Confirmada!"
                html_greeting = f"Hola {recipient_name},"
                html_intro = "Hemos recibido tu pedido de limpieza y ordenanza. Nuestro equipo profesional estará listo para dejar tu propiedad reluciente."
                lbl_order = "Número de Orden"
                lbl_service = "Servicio"
                lbl_size = "Tamaño de Propiedad"
                lbl_date = "Fecha Programada"
                lbl_slot = "Horario"
                lbl_address = "Dirección"
                lbl_addons = "Recargos Adicionales"
                lbl_total = "Total Estimado"
                lbl_notes = "Instrucciones de Acceso"
                lbl_footer = "¿Preguntas o cambios? Escríbenos a info@gopropertycare.com o llámanos al (720) 590-8632."
            else:
                subject = f"GoPropertyCare - Cleaning Booking Confirmation #{order_id}"
                body_text = f"""Hello {recipient_name}!

Thank you for choosing GoPropertyCare for your property cleaning and care needs. We have received and confirmed your service request.

Booking Details:
=========================================
• Order Number: #{order_id}
• Service: {service_name}
• Property Size: {sqft} sq ft
• Scheduled Date: {date_str}
• Time Window: {time_slot_label}
• Address: {street_address}, {city} {zip_code}
• Zone: {zone_label} (Fee: ${delivery_fee:.2f})
• Add-ons & Surcharges:{addons_text}
• Estimated Total: ${total_price:.2f}
=========================================

Access & Special Instructions:
{special_instructions or 'None provided.'}

Our cleaning crew will arrive punctually during the selected window with all required commercial equipment and eco-friendly supplies.

Need changes? Contact us at (720) 590-8632 or info@gopropertycare.com.

Thank you for trusting GoPropertyCare!
The GoPropertyCare Team
Denver, Colorado
"""
                html_title = "Your Cleaning Booking is Confirmed!"
                html_greeting = f"Hello {recipient_name},"
                html_intro = "We have received your cleaning service request. Our professional team will arrive ready to make your property shine."
                lbl_order = "Order Number"
                lbl_service = "Service Tier"
                lbl_size = "Property Size"
                lbl_date = "Scheduled Date"
                lbl_slot = "Time Window"
                lbl_address = "Address"
                lbl_addons = "Property Add-ons / Surcharges"
                lbl_total = "Estimated Total"
                lbl_notes = "Access Instructions"
                lbl_footer = "Questions or adjustments? Reach us at info@gopropertycare.com or (720) 590-8632."

            html_content = f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #dcfce7;">
          <!-- Header -->
          <tr>
            <td style="background-color: #166534; padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">GoPropertyCare</h1>
              <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 14px; font-weight: 500;">Premium Residential & Commercial Cleaning • Denver & Boulder</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #15803d; font-size: 20px; font-weight: 700; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_greeting}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_intro}</p>

              <!-- Order Summary Card -->
              <table width="100%" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_order}</td>
                  <td style="padding: 8px 12px; color: #0f172a; font-size: 15px; font-weight: 700; text-align: right;">#{order_id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">{lbl_service}</td>
                  <td style="padding: 8px 12px; color: #166534; font-size: 14px; font-weight: 700; text-align: right;">{service_name}</td>
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
                  <td style="padding: 12px; color: #166534; font-size: 18px; font-weight: 800; text-align: right;">${total_price:.2f}</td>
                </tr>
              </table>

              {f'''<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 600;">{lbl_notes}:</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #374151;">{special_instructions}</p>
              </div>''' if special_instructions else ''}

              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; text-align: center; margin-top: 24px;">{lbl_footer}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 GoPropertyCare. All rights reserved. Denver & Boulder, CO.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

            from_email = 'GoPropertyCare <info@gopropertycare.com>'
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'info@gopropertycare.com')
            recipients = [recipient_email] if recipient_email else []
            if admin_email and admin_email not in recipients:
                recipients.append(admin_email)

            if not recipients:
                logger.warning(f"[EMAIL SKIP] No recipient found for CleaningOrder #{order_id}")
                return

            send_mail_worker(
                subject=subject,
                text_content=body_text,
                html_content=html_content,
                recipients=recipients,
                reply_to=admin_email,
                from_email=from_email,
            )
            logger.info(f"[EMAIL SUCCESS - GoPropertyCare] Confirmation queued for CleaningOrder #{order_id} to {recipients}")

        except Exception as e:
            logger.error(f"[EMAIL FAILURE - GoPropertyCare] Confirmation failed for CleaningOrder #{order_id}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


def send_cleaning_order_cancellation_email(order, language=None):
    """
    Sends order cancellation email asynchronously for GoPropertyCare.
    """
    order_id = order.id
    lang = language or getattr(order, 'language', 'en') or 'en'
    is_spanish = lang.lower().startswith('es')
    service_date_str = str(order.service_date)
    service_name = getattr(order.service_rate, 'name', 'Cleaning Service')

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
                subject = f"GoPropertyCare - Cancelación de Reserva #{order_id}"
                body_text = f"""Hola {recipient_name},

Tu reserva de servicio de limpieza #{order_id} ({service_name}) programada para {service_date_str} ha sido cancelada exitosamente.

Si no solicitaste esta cancelación o deseas reprogramar, por favor contáctanos al (720) 590-8632 o a info@gopropertycare.com.

Atentamente,
El Equipo de GoPropertyCare
"""
                html_title = f"Reserva #{order_id} Cancelada"
                html_p1 = f"Hola <strong>{recipient_name}</strong>,"
                html_p2 = f"Te confirmamos que tu reserva de servicio de limpieza <strong>#{order_id}</strong> ({service_name}) programada para el <strong>{service_date_str}</strong> ha sido cancelada."
                html_p3 = "Si deseas programar una nueva cita, puedes hacerlo en cualquier momento desde <a href='https://gopropertycare.com/schedule' style='color: #166534; font-weight: 600;'>nuestra plataforma</a>."
            else:
                subject = f"GoPropertyCare - Booking Cancellation #{order_id}"
                body_text = f"""Hello {recipient_name},

Your cleaning service booking #{order_id} ({service_name}) scheduled for {service_date_str} has been cancelled successfully.

If you did not request this cancellation or would like to reschedule, please contact us at (720) 590-8632 or info@gopropertycare.com.

Best regards,
The GoPropertyCare Team
"""
                html_title = f"Booking #{order_id} Cancelled"
                html_p1 = f"Hello <strong>{recipient_name}</strong>,"
                html_p2 = f"We confirm that your cleaning booking <strong>#{order_id}</strong> ({service_name}) scheduled for <strong>{service_date_str}</strong> has been cancelled."
                html_p3 = "If you'd like to book a new appointment, you can do so anytime at <a href='https://gopropertycare.com/schedule' style='color: #166534; font-weight: 600;'>our platform</a>."

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
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">GoPropertyCare</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="color: #dc2626; font-size: 18px; margin-top: 0;">{html_title}</h2>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p1}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p2}</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">{html_p3}</p>
              <p style="color: #64748b; font-size: 13px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Questions? Reach us at info@gopropertycare.com or (720) 590-8632.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

            from_email = 'GoPropertyCare <info@gopropertycare.com>'
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'info@gopropertycare.com')
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
            logger.info(f"[EMAIL SUCCESS - GoPropertyCare] Cancellation queued for CleaningOrder #{order_id} to {recipients}")

        except Exception as e:
            logger.error(f"[EMAIL FAILURE - GoPropertyCare] Cancellation failed for CleaningOrder #{order_id}: {e}", exc_info=True)

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
