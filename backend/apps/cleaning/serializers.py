from decimal import Decimal
from datetime import date, datetime, timedelta
from rest_framework import serializers
from django.utils import timezone
from .models import CleaningServiceRate, CleaningPricingTier, CleaningAddon, CleaningOrder


class CleaningPricingTierSerializer(serializers.ModelSerializer):
    standard_price = serializers.DecimalField(max_digits=7, decimal_places=2, coerce_to_string=False)
    deep_price = serializers.DecimalField(max_digits=7, decimal_places=2, coerce_to_string=False)
    str_on_site_price = serializers.DecimalField(max_digits=7, decimal_places=2, coerce_to_string=False)
    str_off_site_price = serializers.DecimalField(max_digits=7, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = CleaningPricingTier
        fields = (
            'id',
            'brand',
            'tier_number',
            'label',
            'min_sqft',
            'max_sqft',
            'standard_price',
            'deep_price',
            'str_on_site_price',
            'str_off_site_price',
            'is_custom_quote',
            'is_active',
        )


class CleaningServiceRateSerializer(serializers.ModelSerializer):
    rate_per_sqft = serializers.DecimalField(max_digits=7, decimal_places=3, coerce_to_string=True)
    min_order_amount = serializers.DecimalField(max_digits=6, decimal_places=2, coerce_to_string=True)

    class Meta:
        model = CleaningServiceRate
        fields = (
            'id',
            'name',
            'service_type',
            'brand',
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
            'brand',
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
    deposit_amount = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    remaining_balance = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    surcharge_amount = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    final_total_charged = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    payment_method_id = serializers.CharField(required=False, allow_blank=True, write_only=True)

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
            'bedrooms',
            'bathrooms',
            'is_occupied',
            'entry_method',
            'entry_notes',
            'selected_addons',
            'service_date',
            'time_slot',
            'special_instructions',
            'frequency',
            'base_price',
            'addons_total',
            'total_price',
            'deposit_amount',
            'remaining_balance',
            'surcharge_amount',
            'surcharge_concept',
            'final_total_charged',
            'payment_status',
            'payment_method_id',
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
            'deposit_amount',
            'remaining_balance',
            'final_total_charged',
            'payment_status',
            'delivery_fee',
            'created_at',
            'updated_at',
        )


GPC_TIER_MATRIX = [
    (500, 999, Decimal('155.00'), Decimal('235.00')),
    (1000, 1299, Decimal('175.00'), Decimal('270.00')),
    (1300, 1599, Decimal('190.00'), Decimal('295.00')),
    (1600, 1899, Decimal('200.00'), Decimal('320.00')),
    (1900, 2199, Decimal('215.00'), Decimal('360.00')),
    (2200, 2499, Decimal('230.00'), Decimal('410.00')),
    (2500, 2799, Decimal('250.00'), Decimal('460.00')),
    (2800, 3099, Decimal('270.00'), Decimal('505.00')),
    (3100, 3399, Decimal('295.00'), Decimal('550.00')),
    (3400, 3699, Decimal('315.00'), Decimal('590.00')),
    (3700, 3999, Decimal('335.00'), Decimal('640.00')),
    (4000, 4299, Decimal('355.00'), Decimal('695.00')),
    (4300, 4599, Decimal('385.00'), Decimal('740.00')),
    (4600, 4899, Decimal('410.00'), Decimal('785.00')),
    (4900, 5299, Decimal('435.00'), Decimal('820.00')),
    (5300, 5699, Decimal('455.00'), Decimal('850.00')),
    (5700, 6099, Decimal('480.00'), Decimal('890.00')),
]

GPC_STANDARD_FREQUENCY_DISCOUNTS = {
    'weekly': Decimal('0.15'),
    'biweekly': Decimal('0.10'),
    'monthly': Decimal('0.05'),
    'one_time': Decimal('0.00'),
}

GPC_DEEP_FREQUENCY_DISCOUNTS = {
    'monthly': Decimal('0.05'),
    'weekly': Decimal('0.00'),
    'biweekly': Decimal('0.00'),
    'one_time': Decimal('0.00'),
}

GPC_FREQUENCY_DISCOUNTS = GPC_STANDARD_FREQUENCY_DISCOUNTS


def get_gpc_frequency_discount(service_type: str, frequency: str) -> Decimal:
    if service_type in ('residential', 'regular', 'standard'):
        return GPC_STANDARD_FREQUENCY_DISCOUNTS.get(frequency, Decimal('0.00'))
    elif service_type == 'deep':
        return GPC_DEEP_FREQUENCY_DISCOUNTS.get(frequency, Decimal('0.00'))
    return Decimal('0.00')


class CleaningOrderCreateSerializer(serializers.ModelSerializer):
    service_rate_id = serializers.PrimaryKeyRelatedField(
        queryset=CleaningServiceRate.objects.filter(is_active=True),
        source='service_rate'
    )
    deposit_amount = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    remaining_balance = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    surcharge_amount = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    final_total_charged = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    payment_method_id = serializers.CharField(required=False, allow_blank=True, write_only=True)

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
            'bedrooms',
            'bathrooms',
            'is_occupied',
            'entry_method',
            'entry_notes',
            'selected_addons',
            'service_date',
            'time_slot',
            'special_instructions',
            'frequency',
            'base_price',
            'addons_total',
            'total_price',
            'deposit_amount',
            'remaining_balance',
            'surcharge_amount',
            'surcharge_concept',
            'final_total_charged',
            'payment_status',
            'payment_method_id',
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
            'deposit_amount',
            'remaining_balance',
            'final_total_charged',
            'payment_status',
            'status',
            'created_at',
        )

    def validate_service_date(self, value):
        now_local = timezone.localtime(timezone.now())
        today = now_local.date()
        if value < today:
            raise serializers.ValidationError("Service date cannot be in the past.")
        if value == today and now_local.hour >= 12:
            raise serializers.ValidationError(
                "Same-day bookings are only available before 12:00 PM. Please choose tomorrow or a future date."
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

        brand = data.get('brand') or 'gopropertycare'
        service_rate = data.get('service_rate')

        if service_rate:
            if brand == 'gopropertycare' and service_rate.brand != 'gopropertycare':
                raise serializers.ValidationError({
                    'service_rate_id': 'Selected service rate does not belong to GoPropertyCare.'
                })
            elif brand == 'evolvingsolutions' and service_rate.brand != 'evolvingsolutions':
                raise serializers.ValidationError({
                    'service_rate_id': 'Selected service rate does not belong to Evolving Solutions LLC.'
                })

        # Same-day minimum 3-hour notice check
        service_date = data.get('service_date')
        time_slot = data.get('time_slot')
        now_local = timezone.localtime(timezone.now())
        today = now_local.date()

        if service_date == today and time_slot:
            parsed_time = None
            clean_ts = str(time_slot).strip().upper()
            for fmt in ('%I:%M %p', '%I:%M%p', '%H:%M', '%I %p', '%I%p'):
                try:
                    parsed_time = datetime.strptime(clean_ts, fmt).time()
                    break
                except ValueError:
                    continue

            if parsed_time:
                tz = timezone.get_current_timezone()
                target_dt = timezone.make_aware(datetime.combine(today, parsed_time), tz)
                min_notice_dt = now_local + timedelta(hours=3)
                if target_dt < min_notice_dt:
                    min_str = min_notice_dt.strftime('%I:%M %p')
                    raise serializers.ValidationError({
                        'time_slot': f"For same-day service, arrival time must be at least 3 hours from now (earliest: {min_str})."
                    })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        brand = validated_data.get('brand') or 'gopropertycare'
        service_rate = validated_data['service_rate']
        square_feet = validated_data.get('square_feet', 1000)
        frequency = validated_data.get('frequency', 'one_time')
        delivery_zone = validated_data.get('delivery_zone', 'inner')
        selected_addons = validated_data.get('selected_addons', [])

        # Delivery fee calculation
        delivery_fee = Decimal('25.00') if delivery_zone == 'outer' else Decimal('0.00')

        # Base price calculation (using CleaningPricingTier or STR Matrix for GoPropertyCare)
        tier_matched = None
        if brand == 'gopropertycare':
            if service_rate.service_type == 'commercial':
                # Commercial Walkthrough: free on-site consultation / custom quote ($0.00 upfront)
                tier_matched = Decimal('0.00')
                delivery_fee = Decimal('0.00')
            elif service_rate.service_type in ('str_on_site', 'str_off_site', 'short_term_rental'):
                # STR Turnover: priced by bedrooms and bathrooms
                b_rooms = validated_data.get('bedrooms', 1) or 1
                b_aths = float(validated_data.get('bathrooms', 1.0) or 1.0)
                
                str_matrix = {
                    0: {'base': Decimal('90.00'), 'inc_baths': 1, 'laundry': Decimal('45.00')},
                    1: {'base': Decimal('90.00'), 'inc_baths': 1, 'laundry': Decimal('45.00')},
                    2: {'base': Decimal('135.00'), 'inc_baths': 2, 'laundry': Decimal('70.00')},
                    3: {'base': Decimal('185.00'), 'inc_baths': 2, 'laundry': Decimal('95.00')},
                    4: {'base': Decimal('255.00'), 'inc_baths': 3, 'laundry': Decimal('120.00')},
                    5: {'base': Decimal('330.00'), 'inc_baths': 4, 'laundry': Decimal('145.00')},
                }
                
                tier_info = str_matrix.get(b_rooms)
                if tier_info:
                    str_base = tier_info['base']
                    extra_baths = max(0, int(b_aths - tier_info['inc_baths']))
                    extra_baths_fee = Decimal(str(extra_baths * 25))
                    has_offsite_addon = any(
                        isinstance(x, dict) and x.get('code') == 'off_site_laundry'
                        for x in selected_addons
                    )
                    laundry_fee = tier_info['laundry'] if (service_rate.service_type == 'str_off_site' and not has_offsite_addon) else Decimal('0.00')
                    tier_matched = str_base + extra_baths_fee + laundry_fee
                else:
                    tier_matched = Decimal('0.00')  # Custom quote for 6+ bedrooms
            else:
                # Check dynamic CleaningPricingTier from database (allows admin pricing overrides)
                pricing_tier = CleaningPricingTier.objects.filter(
                    brand='gopropertycare',
                    is_active=True,
                    min_sqft__lte=square_feet,
                    max_sqft__gte=square_feet
                ).first()
                if not pricing_tier and square_feet < 500:
                    pricing_tier = CleaningPricingTier.objects.filter(
                        brand='gopropertycare',
                        is_active=True
                    ).order_by('tier_number').first()

                if pricing_tier:
                    if service_rate.service_type in ('move_in_out', 'deep'):
                        tier_matched = pricing_tier.deep_price
                    else:
                        tier_matched = pricing_tier.standard_price
                elif service_rate.service_type in ('residential', 'move_in_out', 'deep'):
                    # Hardcoded fallback matrix if DB tiers are not yet created
                    for min_s, max_s, std_p, deep_p in GPC_TIER_MATRIX:
                        if min_s <= square_feet <= max_s:
                            tier_matched = deep_p if service_rate.service_type in ('move_in_out', 'deep') else std_p
                            break
                    if not tier_matched and square_feet < 500:
                        tier_matched = Decimal('235.00') if service_rate.service_type in ('move_in_out', 'deep') else Decimal('155.00')

        if tier_matched is not None:
            discount_pct = get_gpc_frequency_discount(service_rate.service_type, frequency)
            base_price = round(tier_matched * (Decimal('1.00') - discount_pct), 2)
        else:
            # Standard per sqft calculation (Evolving Solutions & custom rates)
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

        payment_method_id = validated_data.pop('payment_method_id', None)

        order = CleaningOrder.objects.create(
            user=user,
            delivery_fee=delivery_fee,
            base_price=round(base_price, 2),
            addons_total=round(addons_total, 2),
            total_price=round(total_price, 2),
            language=language or 'en',
            **validated_data
        )

        # Calculate 25% deposit and 75% remaining balance
        deposit_val = (order.total_price * Decimal('0.25')).quantize(Decimal('0.01'))
        order.deposit_amount = deposit_val
        order.remaining_balance = order.total_price - deposit_val
        order.save(update_fields=['deposit_amount', 'remaining_balance'])

        if order.brand == 'gopropertycare':
            from apps.core.payments import vault_gpc_payment_method
            try:
                vault_gpc_payment_method(order, payment_method_id=payment_method_id)
            except Exception as pay_err:
                import logging
                logging.getLogger(__name__).warning(f"Card vaulting processing for GPC-#{order.id}: {pay_err}")

        return order
