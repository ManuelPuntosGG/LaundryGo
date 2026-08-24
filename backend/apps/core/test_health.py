import pytest
from rest_framework.test import APIClient
from rest_framework import status


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check_returns_200(self):
        client = APIClient()
        response = client.get('/api/v1/health/')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data.get('status') == 'healthy'
        assert data.get('service') == 'LaundryGo API'
