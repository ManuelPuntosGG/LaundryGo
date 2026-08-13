from django.contrib import admin
from .models import ServiceRate, Order, RecurringSchedule


@admin.register(ServiceRate)
class ServiceRateAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'rate_per_lb', 'delivery_days', 'is_active')
    list_filter = ('service_type', 'is_active')
    search_fields = ('name',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_email', 'service_rate', 'pickup_date', 'pickup_time_slot', 'status', 'created_at')
    list_filter = ('status', 'service_rate', 'pickup_time_slot')
    search_fields = ('guest_email', 'user__email', 'guest_first_name', 'guest_last_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'pickup_date'


@admin.register(RecurringSchedule)
class RecurringScheduleAdmin(admin.ModelAdmin):
    list_display = ('user', 'frequency', 'is_active', 'next_pickup_date', 'created_at')
    list_filter = ('frequency', 'is_active')
    search_fields = ('user__email',)
