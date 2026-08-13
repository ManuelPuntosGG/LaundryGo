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

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone',
            'street_address', 'city', 'zip_code', 'delivery_zone', 'delivery_fee',
            'service_rate', 'service_name', 'service_type', 'rate_per_lb',
            'pickup_date', 'pickup_time_slot', 'order_details', 'pickup_instructions',
            'status', 'customer_name', 'customer_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'status', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    frequency = serializers.ChoiceField(
        choices=[
            ('oneTime', 'One-time'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('fortnightly', 'Fortnightly'),
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

    class Meta:
        model = Order
        fields = (
            'id', 'service_rate', 'pickup_date', 'pickup_time_slot',
            'order_details', 'pickup_instructions',
            'guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone',
            'street_address', 'city', 'zip_code', 'delivery_zone', 'delivery_fee',
            'frequency'
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
        frequency = validated_data.pop('frequency', 'oneTime')
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['user'] = user

        order = super().create(validated_data)

        if frequency and frequency != 'oneTime' and user.is_authenticated:
            from datetime import timedelta
            
            pickup_date = order.pickup_date
            next_date = pickup_date
            if frequency == 'daily':
                next_date += timedelta(days=1)
            elif frequency == 'weekly':
                next_date += timedelta(weeks=1)
            elif frequency == 'fortnightly':
                next_date += timedelta(weeks=2)
            elif frequency == 'monthly':
                next_date += timedelta(days=30)

            RecurringSchedule.objects.create(
                user=user,
                order=order,
                frequency=frequency,
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
