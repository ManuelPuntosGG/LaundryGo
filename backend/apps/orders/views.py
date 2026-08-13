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
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


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


class RecurringScheduleDetailView(generics.RetrieveUpdateAPIView):
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
