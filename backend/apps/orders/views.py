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
        from .emails import send_order_confirmation_email
        send_order_confirmation_email(order)


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
        from .emails import send_order_cancellation_email
        send_order_cancellation_email(order)

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
