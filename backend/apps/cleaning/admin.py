from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from unfold.decorators import display, action
from unfold.enums import ActionVariant
from .models import CleaningServiceRate, CleaningPricingTier, CleaningAddon, CleaningOrder


@admin.register(CleaningPricingTier)
class CleaningPricingTierAdmin(ModelAdmin):
    list_display = (
        'tier_number',
        'label',
        'brand_badge',
        'standard_price',
        'deep_price',
        'str_on_site_price',
        'str_off_site_price',
        'is_custom_quote',
        'is_active',
    )
    list_editable = (
        'standard_price',
        'deep_price',
        'str_on_site_price',
        'str_off_site_price',
        'is_active',
    )
    list_filter = ('brand', 'is_active', 'is_custom_quote')
    list_filter_submit = True
    search_fields = ('label',)
    ordering = ('tier_number',)

    fieldsets = (
        (_('Tier Info'), {
            'fields': ('brand', 'tier_number', 'label', 'min_sqft', 'max_sqft', 'is_custom_quote', 'is_active'),
        }),
        (_('Pricing ($ USD)'), {
            'fields': ('standard_price', 'deep_price', 'str_on_site_price', 'str_off_site_price'),
        }),
    )

    @display(
        description=_('Brand'),
        label={
            'gopropertycare': 'success',
            'evolvingsolutions': 'warning',
        }
    )
    def brand_badge(self, obj):
        return obj.brand, 'GoPropertyCare' if obj.brand == 'gopropertycare' else 'Evolving Solutions'


@admin.register(CleaningServiceRate)
class CleaningServiceRateAdmin(ModelAdmin):
    list_display = (
        'name',
        'brand_badge',
        'service_type_badge',
        'rate_display',
        'min_order_display',
        'is_active_badge',
    )
    list_filter = ('brand', 'service_type', 'is_active')
    list_filter_submit = True
    search_fields = ('name',)
    ordering = ('rate_per_sqft',)

    fieldsets = (
        (_('Service Information'), {
            'fields': ('name', 'brand', 'service_type', 'description'),
        }),
        (_('Pricing & Minimums'), {
            'fields': ('rate_per_sqft', 'min_order_amount', 'is_active'),
        }),
    )

    @display(
        description=_('Brand'),
        label={
            'gopropertycare': 'success',
            'evolvingsolutions': 'warning',
        }
    )
    def brand_badge(self, obj):
        return obj.brand, 'GoPropertyCare' if obj.brand == 'gopropertycare' else 'Evolving Solutions'

    @display(
        description=_('Service Tier'),
        label={
            'regular': 'info',
            'deep': 'primary',
            'move_in_out': 'warning',
            'post_construction': 'danger',
            'commercial': 'secondary',
            'industrial_demolition': 'warning',
        }
    )
    def service_type_badge(self, obj):
        return obj.service_type, obj.get_service_type_display()

    @display(description=_('Rate per Sq Ft'))
    def rate_display(self, obj):
        return f'${obj.rate_per_sqft} / sq ft'

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
        'brand_badge',
        'price_display',
        'is_active_badge',
    )
    list_filter = ('brand', 'is_active')
    search_fields = ('name', 'code')

    fieldsets = (
        (_('Add-on Details'), {
            'fields': ('name', 'code', 'brand', 'price', 'description', 'is_active'),
        }),
    )

    @display(
        description=_('Brand'),
        label={
            'gopropertycare': 'success',
            'evolvingsolutions': 'warning',
            'both': 'info',
        }
    )
    def brand_badge(self, obj):
        labels = {
            'gopropertycare': 'GoPropertyCare',
            'evolvingsolutions': 'Evolving Solutions',
            'both': 'Both Brands',
        }
        return obj.brand, labels.get(obj.brand, obj.brand)

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
        'payment_status_badge',
        'status_badge',
    )
    list_filter = (
        'brand',
        'payment_status',
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
        'stripe_customer_id',
        'stripe_payment_method_id',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
        'base_price',
        'addons_total',
        'delivery_fee',
        'total_price',
        'deposit_amount',
        'remaining_balance',
        'final_total_charged',
        'stripe_customer_id',
        'stripe_payment_method_id',
        'stripe_deposit_intent_id',
        'stripe_final_intent_id',
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
        (_('Property Details & Access'), {
            'fields': (
                ('bedrooms', 'bathrooms'),
                'is_occupied',
                ('entry_method', 'entry_notes'),
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
        (_('Payment & Surcharges (GoPropertyCare)'), {
            'fields': (
                'payment_status',
                ('deposit_amount', 'remaining_balance'),
                ('surcharge_amount', 'surcharge_concept'),
                'final_total_charged',
                ('stripe_customer_id', 'stripe_payment_method_id'),
                ('stripe_deposit_intent_id', 'stripe_final_intent_id'),
            ),
        }),
        (_('Order Status'), {
            'fields': (
                'status',
                ('created_at', 'updated_at'),
            ),
        }),
    )

    @display(description=_('Order #'))
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
        total = (
            float(obj.final_total_charged)
            if obj.final_total_charged is not None
            else (float(obj.total_price or 0) + float(obj.surcharge_amount or 0))
        )
        return f"${total:.2f}"

    @display(
        description=_('Payment Status'),
        label={
            'unpaid': 'warning',
            'deposit_paid': 'info',
            'fully_paid': 'success',
            'charge_failed': 'danger',
            'refunded': 'secondary',
        }
    )
    def payment_status_badge(self, obj):
        return obj.payment_status, obj.get_payment_status_display()

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

    # Bulk status update and payment actions
    actions = [
        'accept_and_charge_deposit',
        'complete_and_charge_order',
        'cancel_and_refund_deposit',
        'cancel_without_refund',
        'mark_in_progress',
        'mark_completed',
        'mark_cancelled',
    ]
    actions_submit_line = [
        'accept_gpc_order_submit',
        'close_gpc_order_submit',
        'cancel_gpc_order_with_refund_submit',
        'cancel_gpc_order_without_refund_submit',
    ]
    actions_detail = [
        'accept_gpc_order_detail',
        'close_gpc_order_detail',
        'cancel_gpc_order_with_refund_detail',
        'cancel_gpc_order_without_refund_detail',
    ]

    # Submit-line actions (Saves form changes including surcharge_amount/surcharge_concept, then runs action)
    @action(
        description=_('Accept Order & Charge 25% Deposit'),
        permissions=['change'],
        variant=ActionVariant.PRIMARY,
    )
    def accept_gpc_order_submit(self, request, obj):
        from apps.core.payments import charge_gpc_deposit
        if obj.brand != 'gopropertycare':
            obj.status = 'confirmed'
            obj.save(update_fields=['status'])
            self.message_user(request, f"Order ESL-#{obj.id} accepted and set as Confirmed.")
            return
        if obj.payment_status in ('deposit_paid', 'fully_paid'):
            self.message_user(request, f"Order GPC-#{obj.id} is already confirmed or deposit already paid.", level='warning')
            return
        try:
            charge_gpc_deposit(obj)
            self.message_user(
                request,
                f"Order GPC-#{obj.id} accepted & confirmed! 25% deposit (${obj.deposit_amount:.2f}) charged and confirmation email sent."
            )
        except Exception as exc:
            self.message_user(request, f"Error accepting GPC-#{obj.id}: {exc}", level='error')

    @action(
        description=_('Close Order & Charge Remaining 75% (+ Surcharge)'),
        permissions=['change'],
        variant=ActionVariant.SUCCESS,
    )
    def close_gpc_order_submit(self, request, obj):
        from apps.core.payments import charge_gpc_remaining_balance
        if obj.brand != 'gopropertycare':
            obj.status = 'completed'
            obj.save(update_fields=['status'])
            self.message_user(request, f"Order ESL-#{obj.id} closed and marked as Completed.")
            return
        try:
            res = charge_gpc_remaining_balance(obj)
            self.message_user(
                request,
                f"Order GPC-#{obj.id} closed & finalized! Charged ${res.get('amount_charged', 0):.2f} (Final Total: ${obj.final_total_charged:.2f}) and sent receipt email."
            )
        except Exception as exc:
            self.message_user(request, f"Error closing GPC-#{obj.id}: {exc}", level='error')

    @action(
        description=_('Cancel Order & Refund 25% Deposit'),
        permissions=['change'],
        variant=ActionVariant.DANGER,
    )
    def cancel_gpc_order_with_refund_submit(self, request, obj):
        from apps.core.payments import refund_gpc_order
        if obj.status == 'cancelled' and obj.payment_status == 'refunded':
            self.message_user(request, f"Order #{obj.id} is already cancelled and refunded.", level='warning')
            return
        try:
            res = refund_gpc_order(obj)
            refund_note = f" (Refunded ${res['refund_amount']:.2f})" if res.get('refunded') else " (No charges were made)"
            self.message_user(
                request,
                f"Order #{obj.id} has been cancelled{refund_note} and cancellation email sent."
            )
        except Exception as exc:
            self.message_user(request, f"Error cancelling/refunding order #{obj.id}: {exc}", level='error')

    @action(
        description=_('Cancel Order Without Refund'),
        permissions=['change'],
        variant=ActionVariant.WARNING,
    )
    def cancel_gpc_order_without_refund_submit(self, request, obj):
        from apps.core.payments import cancel_gpc_order_without_refund
        if obj.status == 'cancelled':
            self.message_user(request, f"Order #{obj.id} is already cancelled.", level='warning')
            return
        try:
            cancel_gpc_order_without_refund(obj)
            self.message_user(
                request,
                f"Order #{obj.id} has been cancelled without refund and cancellation email sent."
            )
        except Exception as exc:
            self.message_user(request, f"Error cancelling order #{obj.id}: {exc}", level='error')

    # Detail header actions
    @action(
        description=_('Accept Order & Charge 25% Deposit'),
        url_path='accept-charge-deposit',
        permissions=['change'],
        variant=ActionVariant.PRIMARY,
    )
    def accept_gpc_order_detail(self, request, object_id):
        from apps.core.payments import charge_gpc_deposit
        obj = self.get_object(request, object_id)
        if obj:
            if obj.brand != 'gopropertycare':
                obj.status = 'confirmed'
                obj.save(update_fields=['status'])
                self.message_user(request, f"Order ESL-#{obj.id} accepted and set as Confirmed.")
            elif obj.payment_status in ('deposit_paid', 'fully_paid'):
                self.message_user(request, f"Order GPC-#{obj.id} is already confirmed or deposit already paid.", level='warning')
            else:
                try:
                    charge_gpc_deposit(obj)
                    self.message_user(
                        request,
                        f"Order GPC-#{obj.id} accepted! 25% deposit (${obj.deposit_amount:.2f}) charged and email sent."
                    )
                except Exception as exc:
                    self.message_user(request, f"Error accepting GPC-#{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:cleaning_cleaningorder_change', args=[object_id]))

    @action(
        description=_('Close Order & Charge 75% (+ Surcharge)'),
        url_path='close-charge-balance',
        permissions=['change'],
        variant=ActionVariant.SUCCESS,
    )
    def close_gpc_order_detail(self, request, object_id):
        from apps.core.payments import charge_gpc_remaining_balance
        obj = self.get_object(request, object_id)
        if obj:
            if obj.brand != 'gopropertycare':
                obj.status = 'completed'
                obj.save(update_fields=['status'])
                self.message_user(request, f"Order ESL-#{obj.id} closed and marked as Completed.")
            else:
                try:
                    res = charge_gpc_remaining_balance(obj)
                    self.message_user(
                        request,
                        f"Order GPC-#{obj.id} closed & finalized! Charged ${res.get('amount_charged', 0):.2f} and sent receipt email."
                    )
                except Exception as exc:
                    self.message_user(request, f"Error closing GPC-#{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:cleaning_cleaningorder_change', args=[object_id]))

    @action(
        description=_('Cancel & Refund 25% Deposit'),
        url_path='cancel-refund-deposit',
        permissions=['change'],
        variant=ActionVariant.DANGER,
    )
    def cancel_gpc_order_with_refund_detail(self, request, object_id):
        from apps.core.payments import refund_gpc_order
        obj = self.get_object(request, object_id)
        if obj:
            if obj.status == 'cancelled' and obj.payment_status == 'refunded':
                self.message_user(request, f"Order #{obj.id} is already cancelled and refunded.", level='warning')
            else:
                try:
                    res = refund_gpc_order(obj)
                    refund_note = f" (Refunded ${res['refund_amount']:.2f})" if res.get('refunded') else " (No charges were made)"
                    self.message_user(request, f"Order #{obj.id} has been cancelled{refund_note} and email sent.")
                except Exception as exc:
                    self.message_user(request, f"Error cancelling/refunding order #{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:cleaning_cleaningorder_change', args=[object_id]))

    @action(
        description=_('Cancel Without Refund'),
        url_path='cancel-no-refund',
        permissions=['change'],
        variant=ActionVariant.WARNING,
    )
    def cancel_gpc_order_without_refund_detail(self, request, object_id):
        from apps.core.payments import cancel_gpc_order_without_refund
        obj = self.get_object(request, object_id)
        if obj:
            if obj.status == 'cancelled':
                self.message_user(request, f"Order #{obj.id} is already cancelled.", level='warning')
            else:
                try:
                    cancel_gpc_order_without_refund(obj)
                    self.message_user(request, f"Order #{obj.id} cancelled without refund and email sent.")
                except Exception as exc:
                    self.message_user(request, f"Error cancelling order #{obj.id}: {exc}", level='error')
        return redirect(reverse('admin:cleaning_cleaningorder_change', args=[object_id]))

    @action(description=_('1. Accept Order & Charge 25%% Deposit (GoPropertyCare)'), permissions=['change'])
    def accept_and_charge_deposit(self, request, queryset):
        from apps.core.payments import charge_gpc_deposit
        success_count = 0
        for order in queryset:
            if order.brand != 'gopropertycare':
                self.message_user(request, f"Order #{order.id} belongs to {order.brand}, not GoPropertyCare.", level='warning')
                continue
            if order.payment_status in ('deposit_paid', 'fully_paid'):
                self.message_user(request, f"Order GPC-#{order.id} is already confirmed or deposit already paid.", level='warning')
                continue
            try:
                charge_gpc_deposit(order)
                success_count += 1
            except Exception as exc:
                self.message_user(request, f"Error accepting GPC-#{order.id}: {exc}", level='error')
        if success_count > 0:
            self.message_user(request, f"Successfully accepted and charged 25% deposit for {success_count} GoPropertyCare order(s).")

    @action(description=_('2. Close Order & Charge Remaining 75%% (+ Surcharge)'), permissions=['change'])
    def complete_and_charge_order(self, request, queryset):
        from apps.core.payments import charge_gpc_remaining_balance
        success_count = 0
        for order in queryset:
            try:
                charge_gpc_remaining_balance(order)
                success_count += 1
            except Exception as exc:
                self.message_user(request, f"Error processing GPC-#{order.id}: {exc}", level='error')
        if success_count > 0:
            self.message_user(request, f"Successfully charged remaining balance and closed {success_count} order(s).")

    @action(description=_('3. Cancel Order & Refund 25%% Deposit'), permissions=['change'])
    def cancel_and_refund_deposit(self, request, queryset):
        from apps.core.payments import refund_gpc_order
        count = 0
        for order in queryset:
            try:
                refund_gpc_order(order)
                count += 1
            except Exception as exc:
                self.message_user(request, f"Error cancelling order #{order.id}: {exc}", level='error')
        if count > 0:
            self.message_user(request, f"Successfully cancelled and processed refund for {count} order(s).")

    @action(description=_('4. Cancel Order (Without Refund)'), permissions=['change'])
    def cancel_without_refund(self, request, queryset):
        from apps.core.payments import cancel_gpc_order_without_refund
        count = 0
        for order in queryset:
            try:
                cancel_gpc_order_without_refund(order)
                count += 1
            except Exception as exc:
                self.message_user(request, f"Error cancelling order #{order.id}: {exc}", level='error')
        if count > 0:
            self.message_user(request, f"Successfully cancelled {count} order(s) without refund.")

    @action(description=_('Mark selected orders as In Progress'))
    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')

    @action(description=_('Mark selected orders as Completed'))
    def mark_completed(self, request, queryset):
        queryset.update(status='completed')

    @action(description=_('Mark selected orders as Cancelled'))
    def mark_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
