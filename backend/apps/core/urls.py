from django.urls import path
from .views import HealthCheckView, StripeWebhookView, StripeConfigView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('payments/stripe-webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('stripe/config/', StripeConfigView.as_view(), name='stripe_config'),
]

