from decimal import Decimal
from datetime import date
from rest_framework import serializers
from django.utils import timezone
from .models import CleaningServiceRate, CleaningAddon, CleaningOrder


class CleaningServiceRateSerializer(serializers.ModelSerializer):
    rate_per_sqft = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)
    min_order_amount = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = CleaningServiceRate
        fields = (
            'id',
            'name',
            'service_type',
            'rate_per_sqft',
            'min_order_amount',
            'description',
            'is_active',
        )


class CleaningAddonSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = CleaningAddon
        fields = (
            'id',
            'name',
            'code',
            'price',
            'description',
            'is_active',
        )


class CleaningOrderSerializer(serializers.ModelSerializer):
    service_rate = CleaningServiceRateSerializer(read_only=True)
    service_rate_id = serializers.PrimaryKeyRelatedField(
        queryset=CleaningServiceRate.objects.filter(is_active=True),
        source='service_rate',
        write_only=True
    )
    delivery_fee = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)
    base_price = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True)
    addons_total = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True)
    total_price = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = CleaningOrder
        fields = (
            'id',
            'user',
            'guest_email',
            'guest_first_name',
            'guest_last_name',
            'guest_phone',
            'street_address',
            'city',
            'zip_code',
            'delivery_zone',
            'delivery_fee',
            'service_rate',
            'service_rate_id',
            'square_feet',
            'selected_addons',
            'service_date',
            'time_slot',
            'special_instructions',
            'base_price',
            'addons_total',
            'total_price',
            'status',
            'brand',
            'language',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'user',
            'base_price',
            'addons_total',
            'total_price',
            'delivery_fee',
            'created_at',
            'updated_at',
        )


class CleaningOrderCreateSerializer(serializers.ModelSerializer):
    service_rate_id = serializers.PrimaryKeyRelatedField(
        queryset=CleaningServiceRate.objects.filter(is_active=True),
        source='service_rate'
    )

    class Meta:
        model = CleaningOrder
        fields = (
            'id',
            'brand',
            'guest_email',
            'guest_first_name',
            'guest_last_name',
            'guest_phone',
            'street_address',
            'city',
            'zip_code',
            'delivery_zone',
            'delivery_fee',
            'service_rate_id',
            'square_feet',
            'selected_addons',
            'service_date',
            'time_slot',
            'special_instructions',
            'base_price',
            'addons_total',
            'total_price',
            'status',
            'language',
            'created_at',
        )
        read_only_fields = (
            'id',
            'delivery_fee',
            'base_price',
            'addons_total',
            'total_price',
            'status',
            'created_at',
        )

    def validate_service_date(self, value):
        today = timezone.localtime(timezone.now()).date()
        if value <= today:
            raise serializers.ValidationError(
                "Same-day bookings are not available. Please choose tomorrow or a future date."
            )
        return value

    def validate_square_feet(self, value):
        if value < 50:
            raise serializers.ValidationError("Square footage must be at least 50 sq ft.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        is_authenticated = request and request.user.is_authenticated

        if not is_authenticated:
            required_guest_fields = ['guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone']
            missing = [f for f in required_guest_fields if not data.get(f)]
            if missing:
                raise serializers.ValidationError({
                    field: 'This field is required for guest checkout.' for field in missing
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        service_rate = validated_data['service_rate']
        square_feet = validated_data.get('square_feet', 1000)
        delivery_zone = validated_data.get('delivery_zone', 'inner')
        selected_addons = validated_data.get('selected_addons', [])

        # Delivery fee calculation
        delivery_fee = Decimal('25.00') if delivery_zone == 'outer' else Decimal('0.00')

        # Base price calculation (sqft * rate_per_sqft, with minimum order of $99)
        raw_base = round(Decimal(str(square_feet)) * service_rate.rate_per_sqft, 2)
        min_order = round(service_rate.min_order_amount, 2)
        base_price = max(raw_base, min_order)

        # Addons total
        addons_total = Decimal('0.00')
        if isinstance(selected_addons, list):
            for item in selected_addons:
                if isinstance(item, dict) and 'price' in item:
                    try:
                        addons_total += Decimal(str(item['price']))
                    except Exception:
                        pass

        addons_total = round(addons_total, 2)
        total_price = round(base_price + addons_total + delivery_fee, 2)

        # Language detection fallback
        language = validated_data.pop('language', None)
        if not language and request:
            accept_lang = request.headers.get('Accept-Language', 'en').lower()
            language = 'es' if accept_lang.startswith('es') else 'en'

        order = CleaningOrder.objects.create(
            user=user,
            delivery_fee=delivery_fee,
            base_price=round(base_price, 2),
            addons_total=round(addons_total, 2),
            total_price=round(total_price, 2),
            language=language or 'en',
            **validated_data
        )

        return order
