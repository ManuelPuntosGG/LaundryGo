from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import display
from .models import Coupon, CouponUsage


class CouponUsageInline(TabularInline):
    model = CouponUsage
    extra = 0
    can_delete = False
    readonly_fields = ('user', 'brand', 'order_type', 'order_id', 'discount_amount', 'redeemed_at')
    fields = ('user', 'brand', 'order_type', 'order_id', 'discount_amount', 'redeemed_at')

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Coupon)
class CouponAdmin(ModelAdmin):
    list_display = (
        'code',
        'brand_badge',
        'discount_display',
        'is_active',
        'usages_count',
        'created_at_display',
    )
    list_editable = ('is_active',)
    list_filter = ('brand', 'is_active', 'created_at')
    list_filter_submit = True
    search_fields = ('code', 'description')
    ordering = ('-created_at',)
    inlines = [CouponUsageInline]

    fieldsets = (
        (_('Coupon Configuration'), {
            'fields': (
                'code',
                'brand',
                'discount_percentage',
                'is_active',
                'description',
            ),
        }),
        (_('Timestamps'), {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

    @display(
        description=_('Brand'),
        label={
            'gopropertycare': 'success',
            'laundrygo': 'info',
        }
    )
    def brand_badge(self, obj):
        labels = {
            'gopropertycare': 'GoPropertyCare',
            'laundrygo': 'LaundryGo',
        }
        return obj.brand, labels.get(obj.brand, obj.brand)

    @display(description=_('Discount'))
    def discount_display(self, obj):
        return f"{obj.discount_percentage}% OFF"

    @display(description=_('Redemptions'))
    def usages_count(self, obj):
        count = obj.usages.count()
        return f"{count} used"

    @display(description=_('Created'))
    def created_at_display(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')


@admin.register(CouponUsage)
class CouponUsageAdmin(ModelAdmin):
    list_display = (
        'id',
        'coupon_code_display',
        'user_display',
        'brand_badge',
        'order_ref_display',
        'discount_display',
        'redeemed_at_display',
    )
    list_filter = ('brand', 'order_type', 'redeemed_at')
    list_filter_submit = True
    search_fields = (
        'coupon__code',
        'user__email',
        'user__first_name',
        'user__last_name',
        'order_id',
    )
    readonly_fields = (
        'coupon',
        'user',
        'brand',
        'order_type',
        'order_id',
        'discount_amount',
        'redeemed_at',
    )
    ordering = ('-redeemed_at',)

    def has_add_permission(self, request):
        return False

    @display(description=_('Coupon'))
    def coupon_code_display(self, obj):
        return obj.coupon.code

    @display(description=_('Customer'))
    def user_display(self, obj):
        return f"{obj.user.email}"

    @display(
        description=_('Brand'),
        label={
            'gopropertycare': 'success',
            'laundrygo': 'info',
        }
    )
    def brand_badge(self, obj):
        labels = {
            'gopropertycare': 'GoPropertyCare',
            'laundrygo': 'LaundryGo',
        }
        return obj.brand, labels.get(obj.brand, obj.brand)

    @display(description=_('Order'))
    def order_ref_display(self, obj):
        prefix = 'GPC' if obj.brand == 'gopropertycare' else 'Order'
        return f"{prefix}-#{obj.order_id} ({obj.get_order_type_display()})"

    @display(description=_('Discount Amount'))
    def discount_display(self, obj):
        return f"-${obj.discount_amount:.2f}"

    @display(description=_('Redeemed At'))
    def redeemed_at_display(self, obj):
        return obj.redeemed_at.strftime('%Y-%m-%d %H:%M')
