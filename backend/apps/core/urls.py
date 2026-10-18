from django.urls import path
from .views import HealthCheckView, StripeWebhookView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('payments/stripe-webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
]

