from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import CleaningServiceRate, CleaningAddon, CleaningOrder
from .serializers import (
    CleaningServiceRateSerializer,
    CleaningAddonSerializer,
    CleaningOrderSerializer,
    CleaningOrderCreateSerializer,
)
from .emails import (
    send_cleaning_order_confirmation_email,
    send_cleaning_order_cancellation_email,
)


class CleaningServiceRateListView(generics.ListAPIView):
    queryset = CleaningServiceRate.objects.filter(is_active=True)
    serializer_class = CleaningServiceRateSerializer
    permission_classes = (permissions.AllowAny,)


class CleaningAddonListView(generics.ListAPIView):
    queryset = CleaningAddon.objects.filter(is_active=True)
    serializer_class = CleaningAddonSerializer
    permission_classes = (permissions.AllowAny,)


class CleaningOrderListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CleaningOrderCreateSerializer
        return CleaningOrderSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return (permissions.AllowAny(),)
        return (permissions.IsAuthenticated(),)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CleaningOrder.objects.filter(user=self.request.user)
        return CleaningOrder.objects.none()

    def perform_create(self, serializer):
        order = serializer.save()
        send_cleaning_order_confirmation_email(order)


class CleaningOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CleaningOrderSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff:
                return CleaningOrder.objects.all()
            return CleaningOrder.objects.filter(user=self.request.user)
        return CleaningOrder.objects.none()


class CleaningOrderCancelView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            if request.user.is_staff:
                order = CleaningOrder.objects.get(pk=pk)
            else:
                order = CleaningOrder.objects.get(pk=pk, user=request.user)
        except CleaningOrder.DoesNotExist:
            return Response(
                {'detail': 'Cleaning order not found or you do not have permission to cancel it.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.status == 'cancelled':
            return Response(
                {'detail': 'This cleaning order has already been cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {
                    'detail': (
                        f'Cannot cancel order in "{order.get_status_display()}" status. '
                        'Please call GoPropertyCare support at (720) 590-8632.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'cancelled'
        order.save()

        send_cleaning_order_cancellation_email(order)
        return Response(CleaningOrderSerializer(order).data, status=status.HTTP_200_OK)


class CleaningAvailableDatesView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        today = timezone.localtime(timezone.now()).date()
        # Strictly starting tomorrow - same day is not available for GoPropertyCare
        dates = []
        for i in range(1, 61):
            date = today + timedelta(days=i)
            dates.append({
                'date': date.isoformat(),
                'available': True,
            })

        return Response(dates)
