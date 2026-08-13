from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import ServiceRate, Order, RecurringSchedule
from .serializers import (
    ServiceRateSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    RecurringScheduleSerializer
)


class ServiceRateListView(generics.ListAPIView):
    queryset = ServiceRate.objects.filter(is_active=True)
    serializer_class = ServiceRateSerializer
    permission_classes = (permissions.AllowAny,)


class OrderListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return (permissions.AllowAny(),)
        return (permissions.IsAuthenticated(),)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()

    def perform_create(self, serializer):
        order = serializer.save()

        try:
            from django.core.mail import send_mail
            from django.conf import settings

            delivery_fee_str = "FREE ($0.00)" if float(order.delivery_fee) == 0 else f"${order.delivery_fee}"

            subject = f"🔔 Nueva Solicitud de Recolección LaundryGo #{order.id}"
            message = (
                f"¡Se ha realizado un nuevo pedido de recolección en LaundryGo!\n\n"
                f"----------------------------------------\n"
                f"DATOS DE LA ORDEN #{order.id}\n"
                f"----------------------------------------\n"
                f"• Cliente: {order.customer_name}\n"
                f"• Correo: {order.customer_email}\n"
                f"• Teléfono: {order.guest_phone or (order.user.phone if order.user else 'N/A')}\n"
                f"• Dirección: {order.street_address}, {order.city} {order.zip_code}\n"
                f"• Tarifa de Envío: {delivery_fee_str} (Zona: {order.delivery_zone})\n\n"
                f"----------------------------------------\n"
                f"DETALLES DEL SERVICIO\n"
                f"----------------------------------------\n"
                f"• Servicio: {order.service_rate.name} (${order.service_rate.rate_per_lb}/lb)\n"
                f"• Fecha de Recolección: {order.pickup_date}\n"
                f"• Horario: {order.get_pickup_time_slot_display()}\n"
                f"• Detalles del Pedido: {order.order_details}\n"
                f"• Instrucciones Especiales: {order.pickup_instructions or 'Ninguna'}\n\n"
                f"Por favor ponerse en contacto con el cliente para confirmar la recolección.\n"
            )
            recipients = [settings.ADMIN_EMAIL]
            if order.customer_email:
                recipients.append(order.customer_email)

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=recipients,
                fail_silently=True,
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send email: {e}")


class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Order.objects.all()
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()


class RecurringScheduleListView(generics.ListAPIView):
    serializer_class = RecurringScheduleSerializer

    def get_queryset(self):
        return RecurringSchedule.objects.filter(user=self.request.user)


class RecurringScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecurringScheduleSerializer

    def get_queryset(self):
        return RecurringSchedule.objects.filter(user=self.request.user)


class AvailableDatesView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        today = timezone.localtime(timezone.now()).date()
        current_hour = timezone.localtime(timezone.now()).hour

        dates = []
        for i in range(30):
            date = today + timedelta(days=i)
            if i == 0 and current_hour >= 12:
                dates.append({
                    'date': date.isoformat(),
                    'goavailable': False,
                    'gofurther_available': False,
                })
            else:
                dates.append({
                    'date': date.isoformat(),
                    'goavailable': True,
                    'gofurther_available': current_hour < 12 if i == 0 else True,
                })

        return Response(dates)
