from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from .models import CleaningServiceRate, CleaningAddon, CleaningOrder


@admin.register(CleaningServiceRate)
class CleaningServiceRateAdmin(ModelAdmin):
    list_display = (
        'name',
        'service_type_badge',
        'rate_display',
        'min_order_display',
        'is_active_badge',
    )
    list_filter = ('service_type', 'is_active')
    list_filter_submit = True
    search_fields = ('name',)
    ordering = ('rate_per_sqft',)

    fieldsets = (
        (_('Service Information'), {
            'fields': ('name', 'service_type', 'description'),
        }),
        (_('Pricing & Minimums'), {
            'fields': ('rate_per_sqft', 'min_order_amount', 'is_active'),
        }),
    )

    @display(
        description=_('Service Tier'),
        label={
            'regular': 'info',
            'deep': 'primary',
            'move_in_out': 'warning',
            'post_construction': 'danger',
        }
    )
    def service_type_badge(self, obj):
        return obj.service_type, obj.get_service_type_display()

    @display(description=_('Rate per Sq Ft'))
    def rate_display(self, obj):
        return f'${obj.rate_per_sqft:.2f} / sq ft'

    @display(description=_('Min. Order'))
    def min_order_display(self, obj):
        return f'${obj.min_order_amount:.2f}'

    @display(
        description=_('Status'),
        label={
            True: 'success',
            False: 'danger',
        }
    )
    def is_active_badge(self, obj):
        return obj.is_active, _('Active') if obj.is_active else _('Inactive')


@admin.register(CleaningAddon)
class CleaningAddonAdmin(ModelAdmin):
    list_display = (
        'name',
        'code',
        'price_display',
        'is_active_badge',
    )
    list_filter = ('is_active',)
    search_fields = ('name', 'code')

    @display(description=_('Surcharge'))
    def price_display(self, obj):
        return f'+${obj.price:.2f}'

    @display(
        description=_('Status'),
        label={
            True: 'success',
            False: 'danger',
        }
    )
    def is_active_badge(self, obj):
        return obj.is_active, _('Active') if obj.is_active else _('Inactive')


@admin.register(CleaningOrder)
class CleaningOrderAdmin(ModelAdmin):
    list_display = (
        'order_number',
        'brand_badge',
        'customer_display',
        'service_info',
        'size_display',
        'scheduled_display',
        'zone_badge',
        'total_display',
        'status_badge',
    )
    list_filter = (
        'brand',
        'status',
        'delivery_zone',
        'service_rate',
        'time_slot',
        'language',
        'service_date',
    )
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
        'city',
        'zip_code',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
        'base_price',
        'addons_total',
        'delivery_fee',
        'total_price',
    )
    ordering = ('-created_at',)

    fieldsets = (
        (_('Customer & Brand Information'), {
            'fields': (
                'brand',
                'user',
                ('guest_first_name', 'guest_last_name'),
                ('guest_email', 'guest_phone'),
                'language',
            ),
        }),
        (_('Property & Address'), {
            'fields': (
                'street_address',
                ('city', 'zip_code'),
                ('delivery_zone', 'delivery_fee'),
            ),
        }),
        (_('Service & Schedule'), {
            'fields': (
                'service_rate',
                'square_feet',
                ('service_date', 'time_slot'),
                'selected_addons',
                'special_instructions',
            ),
        }),
        (_('Pricing Breakdown'), {
            'fields': (
                ('base_price', 'addons_total'),
                'total_price',
            ),
        }),
        (_('Order Status'), {
            'fields': (
                'status',
                ('created_at', 'updated_at'),
            ),
        }),
    )

    @display(description=_('Order #'), header=True)
    def order_number(self, obj):
        prefix = 'ESL' if getattr(obj, 'brand', '') == 'evolvingsolutions' else 'GPC'
        return f'{prefix}-#{obj.id}'

    @display(
        description=_('Brand / Company'),
        label={
            'gopropertycare': 'success',
            'evolvingsolutions': 'warning',
        }
    )
    def brand_badge(self, obj):
        return obj.brand, 'Evolving Solutions' if obj.brand == 'evolvingsolutions' else 'GoPropertyCare'

    @display(description=_('Customer'))
    def customer_display(self, obj):
        if obj.user:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return f"{name} ({obj.user.email})" if name else obj.user.email
        name = f"{obj.guest_first_name} {obj.guest_last_name}".strip()
        return f"{name} ({obj.guest_email}) [Guest]" if name else f"{obj.guest_email} [Guest]"

    @display(description=_('Service'))
    def service_info(self, obj):
        return obj.service_rate.name

    @display(description=_('Size'))
    def size_display(self, obj):
        return f"{obj.square_feet:,} sq ft"

    @display(description=_('Scheduled'))
    def scheduled_display(self, obj):
        slot = dict(obj.TIME_SLOT_CHOICES).get(obj.time_slot, obj.time_slot)
        return f"{obj.service_date} ({slot})"

    @display(
        description=_('Zone'),
        label={
            'inner': 'success',
            'outer': 'warning',
        }
    )
    def zone_badge(self, obj):
        return obj.delivery_zone, 'Inner ($0)' if obj.delivery_zone == 'inner' else 'Outer ($25)'

    @display(description=_('Total'))
    def total_display(self, obj):
        return f"${obj.total_price:.2f}"

    @display(
        description=_('Status'),
        label={
            'pending': 'warning',
            'confirmed': 'info',
            'in_progress': 'primary',
            'completed': 'success',
            'cancelled': 'danger',
        }
    )
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    # Bulk status update actions
    actions = [
        'mark_confirmed',
        'mark_in_progress',
        'mark_completed',
        'mark_cancelled',
    ]

    @action(description=_('Mark selected orders as Confirmed'))
    def mark_confirmed(self, request, queryset):
        queryset.update(status='confirmed')

    @action(description=_('Mark selected orders as In Progress'))
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')

    @action(description=_('Mark selected orders as Completed'))
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')

    @action(description=_('Mark selected orders as Cancelled'))
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
