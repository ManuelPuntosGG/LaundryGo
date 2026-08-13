from rest_framework import serializers
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
            'service_rate', 'service_name', 'service_type', 'rate_per_lb',
            'pickup_date', 'pickup_time_slot', 'order_details', 'pickup_instructions',
            'status', 'customer_name', 'customer_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'status', 'created_at', 'updated_at')

    def validate(self, attrs):
        if 'service_rate' in attrs:
            rate = attrs['service_rate']
            if rate.service_type == 'gofurther':
                from django.utils import timezone
                now = timezone.localtime(timezone.now())
                if now.hour >= 12:
                    raise serializers.ValidationError({
                        'service_rate': 'GoFurther service is only available before 12PM.'
                    })
        return attrs


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            'service_rate', 'pickup_date', 'pickup_time_slot',
            'order_details', 'pickup_instructions',
            'guest_email', 'guest_first_name', 'guest_last_name', 'guest_phone'
        )

    def validate(self, attrs):
        if 'service_rate' in attrs:
            rate = attrs['service_rate']
            if rate.service_type == 'gofurther':
                from django.utils import timezone
                now = timezone.localtime(timezone.now())
                if now.hour >= 12:
                    raise serializers.ValidationError({
                        'service_rate': 'GoFurther service is only available before 12PM.'
                    })
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        if user.is_authenticated:
            validated_data['user'] = user
        return super().create(validated_data)


class RecurringScheduleSerializer(serializers.ModelSerializer):
    order_detail = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = RecurringSchedule
        fields = ('id', 'user', 'order', 'frequency', 'is_active', 'next_pickup_date', 'order_detail')
        read_only_fields = ('id', 'user')
