from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions


class HealthCheckView(APIView):
    """
    Lightweight health check endpoint for Render/uptime monitors.
    Returns HTTP 200 without DB queries to allow sub-5ms responses.
    """
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        return Response(
            {
                'status': 'healthy',
                'service': 'LaundryGo API',
            },
            status=status.HTTP_200_OK
        )


class StripeWebhookView(APIView):
    """
    Webhook endpoint to receive Stripe event callbacks (checkout.session.completed, payment_intent.succeeded).
    Updates order payment statuses automatically.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

        event = None
        from apps.core.payments import get_stripe_client
        client = get_stripe_client()

        if client and webhook_secret and sig_header:
            try:
                event = client.Webhook.construct_event(payload, sig_header, webhook_secret)
            except Exception as e:
                return Response({'error': f'Webhook signature verification failed: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Fallback if raw JSON parsed or test mode
            import json
            try:
                event = json.loads(payload.decode('utf-8'))
            except Exception:
                return Response({'status': 'ignored'}, status=status.HTTP_200_OK)

        event_type = event.get('type') if isinstance(event, dict) else getattr(event, 'type', '')
        data_object = event.get('data', {}).get('object', {}) if isinstance(event, dict) else getattr(event.data, 'object', {})

        # Payment intent succeeded (GoPropertyCare 25% deposit or 75% final charge)
        if event_type == 'payment_intent.succeeded':
            metadata = data_object.get('metadata', {}) if isinstance(data_object, dict) else getattr(data_object, 'metadata', {})
            order_id = metadata.get('order_id')
            charge_type = metadata.get('type')
            if order_id and metadata.get('brand') == 'gopropertycare':
                try:
                    from apps.cleaning.models import CleaningOrder
                    order = CleaningOrder.objects.get(id=order_id)
                    if charge_type in ('deposit_25_pct', 'deposit_25_pct_admin_accepted'):
                        order.payment_status = 'deposit_paid'
                        order.status = 'confirmed'
                        order.save(update_fields=['payment_status', 'status'])
                    elif charge_type == 'final_75_pct_and_surcharge':
                        order.payment_status = 'fully_paid'
                        order.status = 'completed'
                        order.save(update_fields=['payment_status', 'status'])
                except Exception:
                    pass

        return Response({'status': 'success'}, status=status.HTTP_200_OK)
