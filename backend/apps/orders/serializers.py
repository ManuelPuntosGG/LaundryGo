from rest_framework import serializers
from django.utils import timezone
from .models import ServiceRate, Order, RecurringSchedule


class ServiceRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRate
        fields = ('id', 'name', 'service_type', 'rate_per_lb', 'delivery_days', 'description')


class OrderSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service_rate.name', read_only=True)
    service_type = serializers.CharField(source='service_rate.service_type', read_only=True)
    rate_per_lb = serializers.DecimalField(source='service_rate.rate_per_lb', max_digits=5, decimal_places=2, read_only=True)
    customer_name = serializers.ReadOnlyField()
    customer_email = serializers.ReadOnlyField()

    base_price = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    total_price = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    surcharge_amount = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)
    final_total_price = serializers.DecimalField(max_digits=8, decimal_places=2, coerce_to_string=True, required=False)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone',
            'street_address', 'city', 'zip_code', 'delivery_zone', 'delivery_fee',
            'service_rate', 'service_name', 'service_type', 'rate_per_lb',
            'pickup_date', 'pickup_time_slot', 'order_details', 'pickup_instructions',
            'base_price', 'total_price', 'surcharge_amount', 'surcharge_concept',
            'final_total_price', 'payment_status', 'stripe_payment_link_url',
            'status', 'language', 'customer_name', 'customer_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'status', 'payment_status', 'stripe_payment_link_url', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    frequency = serializers.ChoiceField(
        choices=[
            ('oneTime', 'One-time'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('biweekly', 'Biweekly'),
            ('fortnightly', 'Biweekly'),
            ('monthly', 'Monthly'),
        ],
        required=False,
        default='oneTime',
        write_only=True
    )

    guest_email = serializers.EmailField(required=False, allow_blank=True, default='')
    guest_first_name = serializers.CharField(required=False, allow_blank=True, default='')
    guest_last_name = serializers.CharField(required=False, allow_blank=True, default='')
    guest_phone = serializers.CharField(required=False, allow_blank=True, default='')

    street_address = serializers.CharField(required=False, allow_blank=True, default='')
    city = serializers.CharField(required=False, allow_blank=True, default='Denver')
    zip_code = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_zone = serializers.CharField(required=False, allow_blank=True, default='inner')
    delivery_fee = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, default=0.00)
    base_price = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    addons_subtotal = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, default=0.00, write_only=True)
    language = serializers.CharField(required=False, default='en')

    class Meta:
        model = Order
        fields = (
            'id', 'service_rate', 'pickup_date', 'pickup_time_slot',
            'order_details', 'pickup_instructions',
            'guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone',
            'street_address', 'city', 'zip_code', 'delivery_zone', 'delivery_fee',
            'base_price', 'addons_subtotal', 'language', 'frequency'
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        request = self.context.get('request')
        today = timezone.localtime(timezone.now()).date()

        # 1. Past date validation
        pickup_date = attrs.get('pickup_date')
        if pickup_date and pickup_date < today:
            raise serializers.ValidationError({
                'pickup_date': 'Pickup date cannot be in the past.'
            })

        # 2. GoFurther 12 PM cutoff (only applies if pickup_date is today)
        rate = attrs.get('service_rate')
        if rate and rate.service_type == 'gofurther' and pickup_date == today:
            now = timezone.localtime(timezone.now())
            if now.hour >= 12:
                raise serializers.ValidationError({
                    'service_rate': 'Same-day GoFurther service for today is only available before 12:00 PM.'
                })

        # 3. User vs Guest contact info validation
        if request and request.user.is_authenticated:
            user = request.user
            if not attrs.get('guest_email'):
                attrs['guest_email'] = user.email
            if not attrs.get('guest_first_name'):
                attrs['guest_first_name'] = user.first_name
            if not attrs.get('guest_last_name'):
                attrs['guest_last_name'] = user.last_name
            if not attrs.get('guest_phone') and hasattr(user, 'phone'):
                attrs['guest_phone'] = user.phone
        else:
            required_guest_fields = {
                'guest_email': 'Email address is required.',
                'guest_first_name': 'First name is required.',
                'guest_last_name': 'Last name is required.',
                'guest_phone': 'Phone number is required.',
            }
            missing = {}
            for field, msg in required_guest_fields.items():
                if not attrs.get(field, '').strip():
                    missing[field] = msg
            if missing:
                raise serializers.ValidationError(missing)

        return attrs

    def create(self, validated_data):
        from decimal import Decimal
        frequency = validated_data.pop('frequency', 'oneTime')
        addons_subtotal = validated_data.pop('addons_subtotal', Decimal('0.00')) or Decimal('0.00')
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['user'] = user

        # Normalize language preference (fallback to Accept-Language request header)
        req = self.context.get('request')
        lang = validated_data.get('language')
        if not lang and req:
            accept_lang = req.headers.get('Accept-Language', '').lower()
            validated_data['language'] = 'es' if accept_lang.startswith('es') or 'es-' in accept_lang else 'en'
        elif lang:
            validated_data['language'] = 'es' if str(lang).lower().startswith('es') else 'en'

        if 'base_price' not in validated_data or not validated_data.get('base_price'):
            rate = validated_data.get('service_rate')
            rate_per_lb = rate.rate_per_lb if rate else Decimal('2.25')
            estimated_base = max(Decimal('40.00'), (rate_per_lb * Decimal('20.00')).quantize(Decimal('0.01')))
            validated_data['base_price'] = (estimated_base + Decimal(str(addons_subtotal))).quantize(Decimal('0.01'))
        deliv_fee = Decimal(str(validated_data.get('delivery_fee', Decimal('0.00')) or Decimal('0.00'))).quantize(Decimal('0.01'))
        validated_data['total_price'] = validated_data['base_price'] + deliv_fee
        validated_data['payment_status'] = 'unpaid'
        validated_data['status'] = 'pending'

        order = super().create(validated_data)

        if frequency and frequency != 'oneTime' and user.is_authenticated:
            from datetime import timedelta
            
            normalized_frequency = 'biweekly' if frequency == 'fortnightly' else frequency
            pickup_date = order.pickup_date
            next_date = pickup_date
            if normalized_frequency == 'daily':
                next_date += timedelta(days=1)
            elif normalized_frequency == 'weekly':
                next_date += timedelta(weeks=1)
            elif normalized_frequency == 'biweekly':
                next_date += timedelta(weeks=2)
            elif normalized_frequency == 'monthly':
                next_date += timedelta(days=30)

            RecurringSchedule.objects.create(
                user=user,
                order=order,
                frequency=normalized_frequency,
                is_active=True,
                next_pickup_date=next_date
            )

        return order


class RecurringScheduleSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = RecurringSchedule
        fields = ('id', 'user', 'order', 'frequency', 'is_active', 'next_pickup_date', 'order_detail')
        read_only_fields = ('id', 'user')
