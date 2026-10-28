from django.db import models
from apps.core.models import TimeStampedModel
from django.conf import settings


class ServiceRate(TimeStampedModel):
    SERVICE_TYPES = [
        ('standard', 'Standard (2 days)'),
        ('go', 'Go (Next day)'),
        ('gofurther', 'GoFurther (Same day)'),
    ]

    name = models.CharField(max_length=100)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, unique=True)
    rate_per_lb = models.DecimalField(max_digits=5, decimal_places=2)
    delivery_days = models.IntegerField(help_text='Number of days for delivery')
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Service Rate'
        verbose_name_plural = 'Service Rates'
        ordering = ['delivery_days']

    def __str__(self):
        return f'{self.name} - ${self.rate_per_lb}/lb'


class Order(TimeStampedModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('ready', 'Ready for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    TIME_SLOT_CHOICES = [
        ('morning', 'Morning (8AM - 11AM)'),
        ('afternoon', 'Afternoon (12PM - 4PM)'),
    ]

    ZONE_CHOICES = [
        ('inner', 'Downtown Denver Zone (FREE)'),
        ('outer', 'Outer Zone ($25 Fee)'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
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

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
    ]

    service_rate = models.ForeignKey(ServiceRate, on_delete=models.PROTECT, related_name='orders')
    pickup_date = models.DateField()
    pickup_time_slot = models.CharField(max_length=20, choices=TIME_SLOT_CHOICES)
    order_details = models.TextField(help_text='Details about the laundry order')
    pickup_instructions = models.TextField(blank=True, help_text='Special instructions for pickup')

    # Financial & Stripe Payment Link Tracking
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid / Pendiente'),
        ('payment_link_sent', 'Payment Link Sent / Enlace Enviado'),
        ('paid', 'Paid / Pagado'),
        ('failed', 'Payment Failed / Fallido'),
        ('refunded', 'Refunded / Reembolsado'),
    ]

    base_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Base laundry price'
    )
    total_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Estimated or weighed laundry total'
    )
    surcharge_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Optional surcharge for extra weight, special stains or supplies'
    )
    surcharge_concept = models.CharField(
        max_length=255,
        blank=True,
        help_text='Reason or description for surcharge'
    )
    # Coupon & Discount Tracking
    coupon = models.ForeignKey(
        'coupons.Coupon',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='laundry_orders',
        help_text='Discount coupon applied to this order'
    )
    coupon_code = models.CharField(
        max_length=6,
        blank=True,
        help_text='Snapshot of the 6-character coupon code used'
    )
    discount_percentage = models.PositiveSmallIntegerField(
        default=0,
        help_text='Coupon discount percentage applied'
    )
    discount_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text='Dollar amount deducted by the coupon'
    )
    final_total_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Final total amount charged via Stripe payment link'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='unpaid'
    )
    stripe_payment_link_url = models.URLField(
        max_length=500,
        blank=True,
        help_text='Stripe Checkout or Payment Link URL'
    )
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en', blank=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        customer = self.user.email if self.user else self.guest_email
        return f'Order #{self.id} - {customer} - {self.pickup_date}'

    def save(self, *args, **kwargs):
        from decimal import Decimal
        deliv = Decimal(str(self.delivery_fee or '0.00')).quantize(Decimal('0.01'))
        surch = Decimal(str(self.surcharge_amount or '0.00')).quantize(Decimal('0.01'))
        base = Decimal(str(self.base_price or '0.00')).quantize(Decimal('0.01'))
        disc = Decimal(str(self.discount_amount or '0.00')).quantize(Decimal('0.01'))
        tot = Decimal(str(self.total_price or '0.00')).quantize(Decimal('0.01'))

        if base <= Decimal('0.00') and tot > Decimal('0.00'):
            base = max(Decimal('0.00'), tot - deliv + disc)
            self.base_price = base
        elif base <= Decimal('0.00') and tot <= Decimal('0.00') and self.service_rate_id:
            rate_per_lb = Decimal(str(self.service_rate.rate_per_lb)) if self.service_rate else Decimal('2.25')
            base = max(Decimal('40.00'), (rate_per_lb * Decimal('20.00')).quantize(Decimal('0.01')))
            self.base_price = base
            tot = max(Decimal('0.00'), base - disc) + deliv
            self.total_price = tot
        elif base > Decimal('0.00'):
            tot = max(Decimal('0.00'), base - disc) + deliv
            self.total_price = tot

        self.final_total_price = (self.total_price or Decimal('0.00')) + surch
        super().save(*args, **kwargs)

    @property
    def customer_name(self):
        if self.user:
            return f'{self.user.first_name} {self.user.last_name}'
        return f'{self.guest_first_name} {self.guest_last_name}'

    @property
    def customer_email(self):
        return self.user.email if self.user else self.guest_email


class RecurringSchedule(TimeStampedModel):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('biweekly', 'Biweekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recurring_schedules')
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='recurring_schedule')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    is_active = models.BooleanField(default=True)
    next_pickup_date = models.DateField()

    class Meta:
        verbose_name = 'Recurring Schedule'
        verbose_name_plural = 'Recurring Schedules'

    def __str__(self):
        return f'{self.user.email} - {self.frequency} - Next: {self.next_pickup_date}'
