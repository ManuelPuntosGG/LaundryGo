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
