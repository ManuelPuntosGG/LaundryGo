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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en', blank=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        customer = self.user.email if self.user else self.guest_email
        return f'Order #{self.id} - {customer} - {self.pickup_date}'

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
