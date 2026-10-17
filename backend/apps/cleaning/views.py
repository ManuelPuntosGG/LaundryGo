from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
from django.db.models import Q
from .models import CleaningServiceRate, CleaningPricingTier, CleaningAddon, CleaningOrder
from .serializers import (
    CleaningServiceRateSerializer,
    CleaningPricingTierSerializer,
    CleaningAddonSerializer,
    CleaningOrderSerializer,
    CleaningOrderCreateSerializer,
)
from .emails import (
    send_cleaning_order_confirmation_email,
    send_cleaning_order_cancellation_email,
    send_commercial_walkthrough_inquiry_email,
)


class CleaningPricingTierListView(generics.ListAPIView):
    serializer_class = CleaningPricingTierSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = CleaningPricingTier.objects.filter(is_active=True).order_by('tier_number')
        brand = self.request.query_params.get('brand')
        if brand:
            qs = qs.filter(brand=brand)
        return qs


class CleaningServiceRateListView(generics.ListAPIView):
    serializer_class = CleaningServiceRateSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = CleaningServiceRate.objects.filter(is_active=True)
        brand = self.request.query_params.get('brand')
        if brand:
            qs = qs.filter(brand=brand)
        return qs


class CleaningAddonListView(generics.ListAPIView):
    serializer_class = CleaningAddonSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = CleaningAddon.objects.filter(is_active=True)
        brand = self.request.query_params.get('brand')
        if brand:
            qs = qs.filter(Q(brand=brand) | Q(brand='both'))
        return qs


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
            qs = CleaningOrder.objects.filter(user=self.request.user)
            brand = self.request.query_params.get('brand')
            if brand:
                qs = qs.filter(brand=brand)
            return qs
        return CleaningOrder.objects.none()

    @transaction.atomic
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

        brand = getattr(order, 'brand', 'gopropertycare') or 'gopropertycare'
        is_evolving = brand == 'evolvingsolutions'
        company_name = "Evolving Solutions LLC" if is_evolving else "GoPropertyCare"
        company_email = "info@evolvingsolutionsllc.com" if is_evolving else "info@gopropertycare.com"

        if order.status not in ['pending', 'confirmed']:
            return Response(
                {
                    'detail': (
                        f'Cannot cancel order in "{order.get_status_display()}" status. '
                        f'Please call {company_name} support at (720) 590-8632 or email {company_email}.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.status = 'cancelled'
            order.save()

        send_cleaning_order_cancellation_email(order)
        return Response(CleaningOrderSerializer(order).data, status=status.HTTP_200_OK)


class CleaningAvailableDatesView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        now_local = timezone.localtime(timezone.now())
        today = now_local.date()
        # Same-day booking is available if requested before 12:00 PM local time
        start_day = 0 if now_local.hour < 12 else 1
        dates = []
        for i in range(start_day, 61):
            date = today + timedelta(days=i)
            dates.append({
                'date': date.isoformat(),
                'available': True,
                'is_today': (i == 0),
            })

        return Response(dates)


class CommercialWalkthroughInquiryView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        data = request.data or {}
        name = str(data.get('name', '')).strip()
        phone = str(data.get('phone', '')).strip()
        email = str(data.get('email', '')).strip()
        zip_code = str(data.get('zip_code', '')).strip()
        details = str(data.get('details', '')).strip()
        language = str(data.get('language', 'en')).strip()

        errors = {}
        if not name:
            errors['name'] = 'Name is required / El nombre es obligatorio.'
        if not phone:
            errors['phone'] = 'Phone is required / El teléfono es obligatorio.'
        if not email:
            errors['email'] = 'Email is required / El correo electrónico es obligatorio.'
        elif '@' not in email or '.' not in email:
            errors['email'] = 'Please enter a valid email / Por favor ingrese un correo válido.'
        if not zip_code:
            errors['zip_code'] = 'ZIP Code is required / El código postal es obligatorio.'
        if not details:
            errors['details'] = 'Details are required / Los detalles del espacio son obligatorios.'

        if errors:
            return Response(
                {'errors': errors, 'detail': 'Missing or invalid required fields.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inquiry_data = {
            'name': name,
            'phone': phone,
            'email': email,
            'zip_code': zip_code,
            'details': details,
            'language': language,
        }

        send_commercial_walkthrough_inquiry_email(inquiry_data)

        return Response(
            {
                'success': True,
                'message': 'Walkthrough inquiry submitted successfully. Our team will contact you shortly.',
            },
            status=status.HTTP_201_CREATED,
        )
