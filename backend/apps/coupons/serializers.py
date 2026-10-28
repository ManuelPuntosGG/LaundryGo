from decimal import Decimal
import re
from rest_framework import serializers
from .models import Coupon, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    usages_count = serializers.IntegerField(source='usages.count', read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id',
            'code',
            'brand',
            'discount_percentage',
            'is_active',
            'description',
            'usages_count',
            'created_at',
            'updated_at',
        ]


class CouponUsageSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)

    class Meta:
        model = CouponUsage
        fields = [
            'id',
            'coupon',
            'coupon_code',
            'user',
            'user_email',
            'brand',
            'order_id',
            'order_type',
            'discount_amount',
            'redeemed_at',
        ]


class CouponValidateRequestSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)
    brand = serializers.ChoiceField(choices=['laundrygo', 'gopropertycare'])
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        default=Decimal('0.00'),
    )

    def validate_code(self, value):
        val = value.strip().upper()
        if not re.match(r'^[A-Z0-9]{6}$', val):
            raise serializers.ValidationError(
                'Coupon code must be exactly 6 uppercase alphanumeric characters.'
            )
        return val
