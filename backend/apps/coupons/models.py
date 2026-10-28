import re
from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from apps.core.models import TimeStampedModel

coupon_code_validator = RegexValidator(
    regex=r'^[A-Z0-9]{6}$',
    message=_('Coupon code must be exactly 6 characters containing only uppercase letters and numbers.'),
)


class Coupon(TimeStampedModel):
    BRAND_CHOICES = [
        ('laundrygo', 'LaundryGo'),
        ('gopropertycare', 'GoPropertyCare'),
    ]

    code = models.CharField(
        max_length=6,
        validators=[coupon_code_validator],
        help_text=_('Exactly 6 alphanumeric uppercase characters (e.g. SAVE20, SUMM10).'),
        db_index=True,
    )
    brand = models.CharField(
        max_length=30,
        choices=BRAND_CHOICES,
        help_text=_('Commercial brand where this coupon is valid.'),
    )
    discount_percentage = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text=_('Percentage discount between 1% and 100%.'),
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_('Whether this coupon is currently enabled and usable.'),
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text=_('Optional internal description or marketing campaign note.'),
    )

    class Meta:
        verbose_name = _('Coupon')
        verbose_name_plural = _('Coupons')
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['code', 'brand'],
                name='unique_coupon_code_per_brand'
            )
        ]

    def clean(self):
        if self.code:
            self.code = self.code.strip().upper()
            if not re.match(r'^[A-Z0-9]{6}$', self.code):
                raise ValidationError({
                    'code': _('Coupon code must be exactly 6 uppercase alphanumeric characters.')
                })

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} ({self.get_brand_display()} - {self.discount_percentage}%)"


class CouponUsage(models.Model):
    coupon = models.ForeignKey(
        Coupon,
        on_delete=models.CASCADE,
        related_name='usages',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='coupon_usages',
    )
    brand = models.CharField(max_length=30)
    order_id = models.PositiveIntegerField(
        help_text=_('ID of the order where coupon was applied.'),
    )
    order_type = models.CharField(
        max_length=20,
        choices=[('laundry', 'Laundry Order'), ('cleaning', 'Cleaning Order')],
        default='cleaning',
    )
    discount_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text=_('Actual dollar amount deducted by this coupon redemption.'),
    )
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Coupon Usage')
        verbose_name_plural = _('Coupon Usages')
        ordering = ['-redeemed_at']
        constraints = [
            # Enforce 1-time redemption per user per coupon code
            models.UniqueConstraint(
                fields=['coupon', 'user'],
                name='unique_coupon_usage_per_user'
            )
        ]

    def __str__(self):
        return f"{self.user.email} used {self.coupon.code} on {self.order_type} #{self.order_id} (-${self.discount_amount})"
