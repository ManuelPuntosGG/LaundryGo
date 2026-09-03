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
            import threading

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

            def _send_email():
                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=recipients,
                        fail_silently=True,
                    )
                except Exception as ex:
                    import logging
                    logging.getLogger(__name__).warning(f"Background email failed: {ex}")

            threading.Thread(target=_send_email, daemon=True).start()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to initiate order notification: {e}")


class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return Order.objects.all()
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()


class OrderCancelView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            if request.user.is_staff:
                order = Order.objects.get(pk=pk)
            else:
                order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found or you do not have permission to cancel it.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status == 'cancelled':
            return Response(
                {'detail': 'This order has already been cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {
                    'detail': (
                        f'Cannot cancel order in "{order.get_status_display()}" status. '
                        'Orders in progress or delivered cannot be cancelled online. '
                        'Please call LaundryGo support at (720) 590-8632.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'cancelled'
        order.save()

        # If order has an active recurring schedule, pause it
        if hasattr(order, 'recurring_schedule') and order.recurring_schedule:
            order.recurring_schedule.is_active = False
            order.recurring_schedule.save()

        # Send cancellation notification email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            import threading

            subject = f"❌ Cancelación de Orden LaundryGo #{order.id}"
            message = (
                f"La orden #{order.id} ha sido cancelada por el cliente.\n\n"
                f"----------------------------------------\n"
                f"DATOS DE LA ORDEN CANCELADA\n"
                f"----------------------------------------\n"
                f"• Cliente: {order.customer_name}\n"
                f"• Correo: {order.customer_email}\n"
                f"• Servicio: {order.service_rate.name}\n"
                f"• Fecha programada: {order.pickup_date} ({order.get_pickup_time_slot_display()})\n"
                f"• Estado actual: Cancelada\n"
            )
            recipients = [settings.ADMIN_EMAIL]
            if order.customer_email:
                recipients.append(order.customer_email)

            def _send_cancel_email():
                try:
                    send_mail(
                        subject=subject,
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=recipients,
                        fail_silently=True,
                    )
                except Exception as ex:
                    import logging
                    logging.getLogger(__name__).warning(f"Background cancel email failed: {ex}")

            threading.Thread(target=_send_cancel_email, daemon=True).start()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to initiate cancellation email: {e}")

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


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
            is_same_day_available = current_hour < 12 if i == 0 else True
            dates.append({
                'date': date.isoformat(),
                'goavailable': True,
                'gofurther_available': is_same_day_available,
            })

        return Response(dates)
