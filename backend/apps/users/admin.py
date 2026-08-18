from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from unfold.decorators import display
from .models import User


# Unregister default technical/unused models to keep admin clean & minimal
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

try:
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
    admin.site.unregister(OutstandingToken)
    admin.site.unregister(BlacklistedToken)
except (admin.sites.NotRegistered, ImportError):
    pass


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = (
        'email',
        'full_name_display',
        'phone_display',
        'address_display',
        'role_badge',
        'is_active_badge',
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    list_filter_submit = True
    search_fields = (
        'email',
        'first_name',
        'last_name',
        'phone',
        'street_address',
        'city',
        'zip_code',
    )
    ordering = ('email',)
    readonly_fields = ('last_login', 'date_joined')

    fieldsets = (
        (_('Account Credentials'), {
            'fields': ('email', 'password'),
        }),
        (_('Personal Information'), {
            'fields': (
                ('first_name', 'last_name'),
                'phone',
            ),
        }),
        (_('Default Delivery Address'), {
            'fields': (
                'street_address',
                ('city', 'zip_code'),
            ),
        }),
        (_('Permissions & Access Role'), {
            'fields': (
                ('is_active', 'is_staff', 'is_superuser'),
            ),
        }),
        (_('Audit Dates'), {
            'classes': ('collapse',),
            'fields': ('last_login', 'date_joined'),
        }),
    )

    @display(description=_('Full Name'))
    def full_name_display(self, obj):
        name = f'{obj.first_name} {obj.last_name}'.strip()
        return name if name else '—'

    @display(description=_('Phone'))
    def phone_display(self, obj):
        return obj.phone if obj.phone else '—'

    @display(description=_('Default Address'))
    def address_display(self, obj):
        if obj.street_address:
            return f'{obj.street_address}, {obj.city}'
        return '—'

    @display(
        description=_('Role'),
        label={
            'Superuser': 'danger',
            'Staff Admin': 'primary',
            'Customer': 'info',
        }
    )
    def role_badge(self, obj):
        if obj.is_superuser:
            return 'Superuser', '⭐ Super Admin'
        elif obj.is_staff:
            return 'Staff Admin', '🛡️ Staff'
        return 'Customer', '👤 Customer'

    @display(
        description=_('Status'),
        label={
            True: 'success',
            False: 'danger',
        }
    )
    def is_active_badge(self, obj):
        return obj.is_active, _('Active') if obj.is_active else _('Inactive')
