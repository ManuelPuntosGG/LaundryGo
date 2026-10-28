from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Coupon, CouponUsage
from .serializers import CouponValidateRequestSerializer


class CouponValidateView(APIView):
    """
    Validates a coupon code in real time prior to booking submission.
    Requires user authentication to enforce one-time redemption per customer.
    """
    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {
                    'valid': False,
                    'error': 'login_required',
                    'message': 'You must be logged in to apply discount coupons.',
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = CouponValidateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            # Return first human-readable validation error
            error_msg = 'Coupon code must be exactly 6 uppercase alphanumeric characters.'
            if 'code' in serializer.errors:
                error_msg = str(serializer.errors['code'][0])
            elif 'brand' in serializer.errors:
                error_msg = str(serializer.errors['brand'][0])

            return Response(
                {
                    'valid': False,
                    'error': 'invalid_format',
                    'message': error_msg,
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        code = serializer.validated_data['code']
        brand = serializer.validated_data['brand']
        subtotal = serializer.validated_data.get('subtotal', Decimal('0.00'))

        coupon = Coupon.objects.filter(code=code, brand=brand, is_active=True).first()
        if not coupon:
            return Response(
                {
                    'valid': False,
                    'error': 'not_found',
                    'message': f'Coupon code "{code}" is invalid, inactive, or not eligible for this service.',
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already redeemed by this account
        if CouponUsage.objects.filter(coupon=coupon, user=request.user).exists():
            return Response(
                {
                    'valid': False,
                    'error': 'already_used',
                    'message': f'You have already redeemed coupon "{code}". Each coupon can only be used once per account.',
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Compute projected discount amount
        discount_amount = Decimal('0.00')
        if subtotal > Decimal('0.00'):
            discount_amount = (subtotal * Decimal(coupon.discount_percentage) / Decimal('100')).quantize(Decimal('0.01'))

        return Response({
            'valid': True,
            'code': coupon.code,
            'brand': coupon.brand,
            'discount_percentage': coupon.discount_percentage,
            'discount_amount': float(discount_amount),
            'message': f'Coupon "{coupon.code}" applied: {coupon.discount_percentage}% discount!',
        })
