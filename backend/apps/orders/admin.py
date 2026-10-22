from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from unfold.enums import ActionVariant
from .models import ServiceRate, Order, RecurringSchedule


@admin.register(ServiceRate)
class ServiceRateAdmin(ModelAdmin):
    list_display = (
        'name',
        'service_type_badge',
        'rate_display',
        'delivery_days_display',
        'is_active_badge',
    )
    list_filter = ('service_type', 'is_active')
    list_filter_submit = True
    search_fields = ('name',)
    ordering = ('delivery_days',)

    fieldsets = (
        (_('Service Information'), {
            'fields': ('name', 'service_type', 'description'),
        }),
        (_('Pricing & Turnaround'), {
            'fields': ('rate_per_lb', 'delivery_days', 'is_active'),
        }),
    )

    @display(
        description=_('Service Tier'),
        label={
            'standard': 'info',
            'go': 'primary',
            'gofurther': 'warning',
        }
    )
    def service_type_badge(self, obj):
        return obj.service_type, obj.get_service_type_display()

    @display(description=_('Rate per Lb'))
    def rate_display(self, obj):
        return f'${obj.rate_per_lb} / lb'

    @display(description=_('Turnaround'))
    def delivery_days_display(self, obj):
        if obj.delivery_days == 0:
            return '⚡ Same Day'
        elif obj.delivery_days == 1:
            return '🚀 Next Day (24h)'
        return f'📦 {obj.delivery_days} Days'

    @display(
        description=_('Status'),
        label={
            True: 'success',
            False: 'danger',
        }
    )
    def is_active_badge(self, obj):
        return obj.is_active, _('Active') if obj.is_active else _('Inactive')


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = (
        'order_id_display',
        'status_badge',
        'payment_status_badge',
        'total_price_display',
        'customer_display',
        'service_rate_display',
        'pickup_schedule_display',
        'delivery_zone_badge',
        'created_at_display',
    )
    list_filter = ('status', 'payment_status', 'delivery_zone', 'service_rate', 'pickup_time_slot', 'pickup_date')
    list_filter_submit = True
    search_fields = (
        'id',
        'user__email',
        'user__first_name',
        'user__last_name',
        'guest_email',
        'guest_first_name',
        'guest_last_name',
        'guest_phone',
        'street_address',
        'zip_code',
    )
    readonly_fields = ('created_at', 'updated_at', 'final_total_price')
    date_hierarchy = 'pickup_date'
    ordering = ('-created_at',)
    actions = [
        'mark_confirmed',
        'finalize_and_send_payment_link',
        'mark_processing',
        'mark_ready',
        'mark_delivered',
        'mark_cancelled',
    ]
    actions_submit_line = [
        'accept_order_submit',
        'close_order_submit',
    ]
    actions_detail = [
        'accept_order_detail',
        'close_order_detail',
    ]

    fieldsets = (
        (_('Order Status & Service Speed'), {
            'fields': (
                'status',
                'service_rate',
            ),
        }),
        (_('Customer & Contact Details'), {
            'fields': (
                'user',
                ('guest_first_name', 'guest_last_name'),
                ('guest_email', 'guest_phone'),
            ),
        }),
        (_('Pickup & Delivery Logistics'), {
            'fields': (
                ('pickup_date', 'pickup_time_slot'),
                'street_address',
                ('city', 'zip_code'),
                ('delivery_zone', 'delivery_fee'),
            ),
        }),
        (_('Pricing & Final Invoice'), {
            'fields': (
                'payment_status',
                ('base_price', 'total_price'),
                ('surcharge_amount', 'surcharge_concept'),
                'final_total_price',
            ),
        }),
        (_('Wash Details & Special Instructions'), {
            'fields': (
                'order_details',
                'pickup_instructions',
            ),
        }),
        (_('Timestamps & Audit'), {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    @display(description=_('Order ID'))
    def order_id_display(self, obj):
        return f'#{obj.id}'

    @display(
        description=_('Status'),
        label={
            'pending': 'warning',
            'confirmed': 'info',
            'processing': 'primary',
            'ready': 'secondary',
            'delivered': 'success',
            'cancelled': 'danger',
        }
    )
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    @display(
        description=_('Payment Status'),
        label={
            'unpaid': 'warning',
            'payment_link_sent': 'info',
            'paid': 'success',
            'failed': 'danger',
            'refunded': 'secondary',
        }
    )
    def payment_status_badge(self, obj):
        return obj.payment_status, obj.get_payment_status_display()

    @display(description=_('Total Price'))
    def total_price_display(self, obj):
        total = (
            float(obj.final_total_price)
            if obj.final_total_price is not None
            else (float(obj.total_price or 0) + float(obj.surcharge_amount or 0))
        )
        return f"${total:.2f}"

    # Submit-line actions (Saves form changes including surcharge_amount/surcharge_concept, then runs action)
    @action(
        description=_('Accept Order (Confirm & Open)'),
        permissions=['change'],
        variant=ActionVariant.PRIMARY,
    )
    def accept_order_submit(self, request, obj):
        from apps.core.payments import accept_laundry_order
        try:
            accept_laundry_order(obj)
            self.message_user(request, f"Order #{obj.id} accepted and set as Confirmed & Open. Notification email sent.")
        except Exception as exc:
            self.message_user(request, f"Error accepting Order #{obj.id}: {exc}", level='error')

    @action(
        description=_('Close Order & Finalize Invoice'),
        permissions=['change'],
        variant=ActionVariant.SUCCESS,
    )
    def close_order_submit(self, request, obj):
        from apps.core.payments import finalize_laundry_order
        try:
            finalize_laundry_order(obj)
            self.message_user(
                request,
                f"Order #{obj.id} closed and finalized (Total: ${obj.final_total_price:.2f}). Final invoice email sent to customer and company."
            )
        except Exception as exc:
            self.message_user(request, f"Error closing Order #{obj.id}: {exc}", level='error')

    # Detail header actions
    @action(
        description=_('Accept Order'),
        url_path='accept-order',
        permissions=['change'],
        variant=ActionVariant.PRIMARY,
    )
    def accept_order_detail(self, request, object_id):
        from apps.core.payments import accept_laundry_order
        obj = self.get_object(request, object_id)
        if obj:
            try:
                accept_laundry_order(obj)
                self.message_user(request, f"Order #{obj.id} accepted and set as Confirmed & Open.")
            except Exception as exc:
                self.message_user(request, f"Error accepting Order #{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:orders_order_change', args=[object_id]))

    @action(
        description=_('Close Order & Finalize Invoice'),
        url_path='close-order-invoice',
        permissions=['change'],
        variant=ActionVariant.SUCCESS,
    )
    def close_order_detail(self, request, object_id):
        from apps.core.payments import finalize_laundry_order
        obj = self.get_object(request, object_id)
        if obj:
            try:
                finalize_laundry_order(obj)
                self.message_user(
                    request,
                    f"Order #{obj.id} closed and finalized (Total: ${obj.final_total_price:.2f}). Final invoice email sent."
                )
            except Exception as exc:
                self.message_user(request, f"Error closing Order #{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:orders_order_change', args=[object_id]))

    # Changelist Bulk Actions
    @action(description=_('1. Accept Order (Mark Confirmed & Open)'), permissions=['change'])
    def mark_confirmed(self, request, queryset):
        from apps.core.payments import accept_laundry_order
        count = 0
        for order in queryset:
            accept_laundry_order(order)
            count += 1
        self.message_user(request, f'{count} order(s) accepted, marked as Confirmed, and notified by email.')

    @action(description=_('2. Close Order & Finalize Invoice to Customer'), permissions=['change'])
    def finalize_and_send_payment_link(self, request, queryset):
        from apps.core.payments import finalize_laundry_order
        success_count = 0
        for order in queryset:
            try:
                finalize_laundry_order(order)
                success_count += 1
            except Exception as exc:
                self.message_user(request, f"Error finalizing Order #{order.id}: {exc}", level='error')
        if success_count > 0:
            self.message_user(request, f"Closed {success_count} order(s) and sent final invoice to customer and company.")

    @display(description=_('Customer'))
    def customer_display(self, obj):
        name = (obj.customer_name or '').strip() or 'Guest'
        email = obj.customer_email or ''
        return f'{name} ({email})' if email else name

    @display(description=_('Service Speed'))
    def service_rate_display(self, obj):
        if not obj.service_rate:
            return '—'
        return f'{obj.service_rate.name} (${obj.service_rate.rate_per_lb}/lb)'

    @display(description=_('Pickup Schedule'))
    def pickup_schedule_display(self, obj):
        slot_label = 'Morning (8-11 AM)' if obj.pickup_time_slot == 'morning' else 'Afternoon (12-4 PM)'
        return f'{obj.pickup_date} • {slot_label}'

    @display(
        description=_('Zone & Fee'),
        label={
            'inner': 'success',
            'outer': 'warning',
        }
    )
    def delivery_zone_badge(self, obj):
        fee = float(obj.delivery_fee) if obj.delivery_fee is not None else 0.0
        zone_label = 'Downtown (Free)' if obj.delivery_zone == 'inner' else f'Outer Zone (+${fee:.2f})'
        return obj.delivery_zone or 'inner', zone_label

    @display(description=_('Created'))
    def created_at_display(self, obj):
        if not obj.created_at:
            return '—'
        return obj.created_at.strftime('%b %d, %Y %I:%M %p')

    @action(description=_('Mark selected orders as In Processing'), permissions=['change'])
    def mark_processing(self, request, queryset):
        count = queryset.update(status='processing')
        self.message_user(request, f'{count} order(s) marked as In Processing.')

    @action(description=_('Mark selected orders as Ready for Delivery'), permissions=['change'])
    def mark_ready(self, request, queryset):
        count = queryset.update(status='ready')
        self.message_user(request, f'{count} order(s) marked as Ready for Delivery.')

    @action(description=_('Mark selected orders as Delivered'), permissions=['change'])
    def mark_delivered(self, request, queryset):
        count = queryset.update(status='delivered')
        self.message_user(request, f'{count} order(s) marked as Delivered.')

    @action(description=_('Cancel selected orders'), permissions=['change'])
    def mark_cancelled(self, request, queryset):
        count = queryset.update(status='cancelled')
        self.message_user(request, f'{count} order(s) Cancelled.')


@admin.register(RecurringSchedule)
class RecurringScheduleAdmin(ModelAdmin):
    list_display = (
        'user_display',
        'frequency_badge',
        'is_active_badge',
        'next_pickup_display',
        'linked_order_display',
        'created_at_display',
    )
    list_filter = ('frequency', 'is_active', 'next_pickup_date')
    list_filter_submit = True
    search_fields = (
        'user__email',
        'user__first_name',
        'user__last_name',
        'order__id',
    )
    ordering = ('next_pickup_date',)
    actions = ['activate_schedules', 'pause_schedules']

    fieldsets = (
        (_('Subscription Plan'), {
            'fields': (
                'user',
                'order',
                ('frequency', 'is_active'),
                'next_pickup_date',
            ),
        }),
    )

    @display(description=_('Customer'))
    def user_display(self, obj):
        name = f'{obj.user.first_name} {obj.user.last_name}'.strip() or 'User'
        return f'{name} ({obj.user.email})'

    @display(
        description=_('Frequency'),
        label={
            'daily': 'danger',
            'weekly': 'primary',
            'biweekly': 'info',
            'fortnightly': 'info',
            'monthly': 'secondary',
        }
    )
    def frequency_badge(self, obj):
        return obj.frequency, obj.get_frequency_display()

    @display(
        description=_('Subscription Status'),
        label={
            True: 'success',
            False: 'warning',
        }
    )
    def is_active_badge(self, obj):
        return obj.is_active, _('Active (7.5% Off)') if obj.is_active else _('Paused')

    @display(description=_('Next Scheduled Pickup'))
    def next_pickup_display(self, obj):
        return f'📅 {obj.next_pickup_date}'

    @display(description=_('Linked Base Order'))
    def linked_order_display(self, obj):
        return f'Order #{obj.order.id}'

    @display(description=_('Created'))
    def created_at_display(self, obj):
        return obj.created_at.strftime('%b %d, %Y')

    # Bulk Actions
    @action(description=_('Activate selected subscription schedules'), permissions=['change'])
    def activate_schedules(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} subscription(s) activated.')

    @action(description=_('Pause selected subscription schedules'), permissions=['change'])
    def pause_schedules(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} subscription(s) paused.')
