from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel


class CleaningServiceRate(TimeStampedModel):
    SERVICE_TYPES = [
        ('regular', 'Limpieza Regular'),
        ('deep', 'Limpieza Profunda (GoFurther)'),
        ('move_in_out', 'Limpieza MoveIn/MoveOut'),
        ('post_construction', 'Limpieza Post-Construcción'),
    ]

    name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=30, choices=SERVICE_TYPES, unique=True)
    rate_per_sqft = models.DecimalField(
        max_digits=6,
        decimal_places=4,
        help_text='Rate per square foot (e.g. 0.1000 for $0.10/sqft)'
    )
    min_order_amount = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=99.00,
        help_text='Minimum service fee threshold in USD'
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Cleaning Service Rate'
        verbose_name_plural = 'Cleaning Service Rates'
        ordering = ['rate_per_sqft']

    def __str__(self):
        return f'{self.name} - ${self.rate_per_sqft}/sqft'


class CleaningAddon(TimeStampedModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Cleaning Add-on / Surcharge'
        verbose_name_plural = 'Cleaning Add-ons / Surcharges'
        ordering = ['price']

    def __str__(self):
        return f'{self.name} (+${self.price})'


class CleaningOrder(TimeStampedModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    TIME_SLOT_CHOICES = [
        ('morning', 'Morning (8:00 AM - 12:00 PM)'),
        ('afternoon', 'Afternoon (1:00 PM - 5:00 PM)'),
    ]

    ZONE_CHOICES = [
        ('inner', 'Denver & Boulder Metro (FREE)'),
        ('outer', 'Outer Zone ($25 Fee)'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cleaning_orders'
    )
    guest_email = models.EmailField(blank=True)
    guest_first_name = models.CharField(max_length=100, blank=True)
    guest_last_name = models.CharField(max_length=100, blank=True)
    guest_phone = models.CharField(max_length=20, blank=True)

    street_address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, default='Denver')
    zip_code = models.CharField(max_length=20, blank=True)
    delivery_zone = models.CharField(max_length=20, choices=ZONE_CHOICES, default='inner')
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    service_rate = models.ForeignKey(
        CleaningServiceRate,
        on_delete=models.PROTECT,
        related_name='orders'
    )
    square_feet = models.PositiveIntegerField(
        default=1000,
        help_text='Property size in square feet'
    )
    selected_addons = models.JSONField(
        default=list,
        blank=True,
        help_text='List of selected addon objects or codes'
    )
    service_date = models.DateField(help_text='Scheduled date for cleaning service')
    time_slot = models.CharField(max_length=20, choices=TIME_SLOT_CHOICES)
    special_instructions = models.TextField(blank=True, help_text='Property access, gate codes or special notes')

    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=99.00)
    addons_total = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=99.00)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en', blank=True)

    class Meta:
        verbose_name = 'Cleaning Order'
        verbose_name_plural = 'Cleaning Orders'
        ordering = ['-created_at']

    def __str__(self):
        client = self.user.email if self.user else self.guest_email or 'Guest'
        return f'GPC-#{self.id} - {self.service_rate.name} ({self.square_feet} sqft) - {client}'
