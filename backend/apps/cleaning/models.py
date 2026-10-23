from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel


BRAND_CHOICES = [
    ('gopropertycare', 'GoPropertyCare (Residential)'),
    ('evolvingsolutions', 'Evolving Solutions LLC (Commercial & Post-Construction)'),
]


class CleaningServiceRate(TimeStampedModel):
    SERVICE_TYPES = [
        ('residential', 'Basic Residential Cleaning'),
        ('move_in_out', 'Move In / Out Cleaning'),
        ('str_on_site', 'Short Term Rentals (Laundry on site)'),
        ('str_off_site', 'Short Term Rentals (Off Site Laundry)'),
        ('short_term_rental', 'Short-Term Rentals Turnover (Airbnb / VRBO)'),
        ('commercial', 'Commercial Cleaning'),
        ('post_construction', 'Post-Construction Cleaning'),
        ('regular', 'Limpieza Regular'),
        ('deep', 'Limpieza Profunda (GoFurther)'),
        ('industrial_demolition', 'Demolición de Drywall y Mano de Obra Industrial'),
    ]

    RESIDENTIAL_SERVICES = ('residential', 'regular', 'deep', 'move_in_out', 'short_term_rental', 'str_on_site', 'str_off_site')
    COMMERCIAL_SERVICES = ('commercial', 'post_construction', 'industrial_demolition')

    name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=30, choices=SERVICE_TYPES)
    brand = models.CharField(
        max_length=30,
        choices=BRAND_CHOICES,
        default='gopropertycare',
        help_text='Brand providing this service'
    )
    rate_per_sqft = models.DecimalField(
        max_digits=7,
        decimal_places=3,
        help_text='Rate per square foot (e.g. 0.125 for $0.125/sqft)'
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
        constraints = [
            models.UniqueConstraint(fields=['service_type', 'brand'], name='unique_service_type_per_brand')
        ]

    def __str__(self):
        return f'{self.name} ({self.get_brand_display()}) - ${self.rate_per_sqft}/sqft'


class CleaningPricingTier(TimeStampedModel):
    brand = models.CharField(
        max_length=30,
        choices=BRAND_CHOICES,
        default='gopropertycare',
        help_text='Brand using this pricing tier'
    )
    tier_number = models.PositiveIntegerField(
        help_text='Tier number (e.g. 1 to 19)'
    )
    label = models.CharField(
        max_length=100,
        help_text='Display label, e.g. "500 – 999 sq ft"'
    )
    min_sqft = models.PositiveIntegerField(
        default=500,
        help_text='Minimum square footage for this tier'
    )
    max_sqft = models.PositiveIntegerField(
        default=999,
        help_text='Maximum square footage for this tier'
    )
    standard_price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0.00,
        help_text='Standard cleaning flat price'
    )
    deep_price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0.00,
        help_text='Deep / Move-In / Move-Out cleaning flat price'
    )
    str_on_site_price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0.00,
        help_text='Short-Term Rental (Laundry On-Site) flat price'
    )
    str_off_site_price = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        default=0.00,
        help_text='Short-Term Rental (Off-Site Laundry) flat price'
    )
    is_custom_quote = models.BooleanField(
        default=False,
        help_text='Whether this tier requires custom quotes (e.g. > 6,100 sq ft)'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this tier is currently active'
    )

    class Meta:
        verbose_name = 'Cleaning Pricing Tier'
        verbose_name_plural = 'Cleaning Pricing Tiers'
        ordering = ['brand', 'tier_number']
        constraints = [
            models.UniqueConstraint(fields=['brand', 'tier_number'], name='unique_tier_per_brand')
        ]

    def __str__(self):
        return f'Tier {self.tier_number} ({self.label}) [{self.get_brand_display()}] - Std: ${self.standard_price}'


class CleaningAddon(TimeStampedModel):
    ADDON_BRAND_CHOICES = [
        ('gopropertycare', 'GoPropertyCare (Residential)'),
        ('evolvingsolutions', 'Evolving Solutions LLC (Commercial)'),
        ('both', 'Both Brands'),
    ]

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    brand = models.CharField(
        max_length=30,
        choices=ADDON_BRAND_CHOICES,
        default='gopropertycare',
        help_text='Target brand for this add-on'
    )
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Cleaning Add-on'
        verbose_name_plural = 'Cleaning Add-ons'
        ordering = ['price']
        constraints = [
            models.UniqueConstraint(fields=['code', 'brand'], name='unique_addon_code_per_brand')
        ]

    def __str__(self):
        return f'{self.name} [{self.brand}] (+${self.price})'


class CleaningOrder(TimeStampedModel):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
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
        ('inner', 'Denver Metro (FREE)'),
        ('outer', 'Outer Zone ($25 Fee)'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
    ]

    BRAND_CHOICES = [
        ('gopropertycare', 'GoPropertyCare'),
        ('evolvingsolutions', 'Evolving Solutions LLC'),
    ]

    brand = models.CharField(max_length=30, choices=BRAND_CHOICES, default='gopropertycare', blank=True)

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
    bedrooms = models.PositiveSmallIntegerField(default=1, null=True, blank=True, help_text="Number of bedrooms")
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0, null=True, blank=True, help_text="Number of bathrooms")
    is_occupied = models.BooleanField(default=True, help_text="Whether property is occupied/furnished or vacant")
    entry_method = models.CharField(max_length=50, blank=True, default='someone_home', help_text="Access method")
    entry_notes = models.CharField(max_length=255, blank=True, help_text="Access code or key notes")
    service_date = models.DateField(help_text='Scheduled date for cleaning service')
    time_slot = models.CharField(max_length=50, help_text='Selected time or window (e.g. 02:00 PM, morning, afternoon)')
    special_instructions = models.TextField(blank=True, help_text='Property access, gate codes or special notes')
    frequency = models.CharField(
        max_length=30,
        default='one_time',
        blank=True,
        help_text='Recurring frequency: one_time, weekly, biweekly, monthly'
    )

    base_price = models.DecimalField(max_digits=8, decimal_places=2, default=99.00)
    addons_total = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=99.00)

    # 25% Deposit, 75% Remaining & Surcharge Financial Tracking
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid / Pendiente'),
        ('deposit_paid', 'Deposit Paid (25%) / Anticipo Pagado'),
        ('fully_paid', 'Fully Paid (100%) / Pagado Completo'),
        ('charge_failed', 'Charge Failed / Cobro Fallido'),
        ('refunded', 'Refunded / Reembolsado'),
    ]

    deposit_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Initial 25% deposit amount charged at booking'
    )
    remaining_balance = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Remaining 75% balance to be charged upon completion'
    )
    surcharge_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Optional surcharge added by admin for unforeseen conditions'
    )
    surcharge_concept = models.CharField(
        max_length=255,
        blank=True,
        help_text='Reason or description for surcharge'
    )
    final_total_charged = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Total amount charged: deposit + remaining balance + surcharge'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid'
    )
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_payment_method_id = models.CharField(max_length=255, blank=True)
    stripe_deposit_intent_id = models.CharField(max_length=255, blank=True)
    stripe_final_intent_id = models.CharField(max_length=255, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en', blank=True)

    def save(self, *args, **kwargs):
        from decimal import Decimal
        if self.total_price:
            tot = Decimal(str(self.total_price)).quantize(Decimal('0.01'))
            if self.payment_status == 'unpaid' or self.deposit_amount == 0 or self.remaining_balance == 0:
                self.deposit_amount = (tot * Decimal('0.25')).quantize(Decimal('0.01'))
                self.remaining_balance = tot - self.deposit_amount
            if self.payment_status == 'fully_paid':
                surch = Decimal(str(self.surcharge_amount or '0.00')).quantize(Decimal('0.01'))
                self.final_total_charged = (self.deposit_amount or Decimal('0.00')) + (self.remaining_balance or Decimal('0.00')) + surch
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Cleaning Order'
        verbose_name_plural = 'Cleaning Orders'
        ordering = ['-created_at']

    def __str__(self):
        client = self.user.email if self.user else self.guest_email or 'Guest'
        prefix = 'ESL' if self.brand == 'evolvingsolutions' else 'GPC'
        return f'{prefix}-#{self.id} - {self.service_rate.name} ({self.square_feet} sqft) - {client}'
