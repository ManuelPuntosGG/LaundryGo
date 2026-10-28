import pytest
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.coupons.models import Coupon, CouponUsage
from apps.orders.models import ServiceRate, Order
from apps.cleaning.models import CleaningServiceRate, CleaningOrder

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(
        username='customer@example.com',
        email='customer@example.com',
        password='StrongPassword123!',
        first_name='John',
        last_name='Doe',
        phone='3035550100',
    )


@pytest.fixture
def second_user(db):
    return User.objects.create_user(
        username='customer2@example.com',
        email='customer2@example.com',
        password='StrongPassword123!',
        first_name='Jane',
        last_name='Smith',
        phone='3035550101',
    )


@pytest.fixture
def laundry_rate(db):
    return ServiceRate.objects.create(
        name='Standard Wash',
        service_type='standard',
        rate_per_lb=Decimal('2.25'),
        delivery_days=2,
        is_active=True,
    )


@pytest.fixture
def cleaning_rate(db):
    return CleaningServiceRate.objects.create(
        name='Standard Residential Cleaning',
        service_type='residential',
        brand='gopropertycare',
        rate_per_sqft=Decimal('0.125'),
        min_order_amount=Decimal('99.00'),
        is_active=True,
    )


@pytest.fixture
def laundry_coupon(db):
    return Coupon.objects.create(
        code='SAVE20',
        brand='laundrygo',
        discount_percentage=Decimal('20.00'),
        is_active=True,
    )


@pytest.fixture
def gpc_coupon(db):
    return Coupon.objects.create(
        code='GPC100',
        brand='gopropertycare',
        discount_percentage=Decimal('15.00'),
        is_active=True,
    )


@pytest.mark.django_db
class TestCouponModel:
    def test_coupon_valid_code(self):
        c = Coupon(code='PROMO1', brand='laundrygo', discount_percentage=Decimal('10.00'))
        c.full_clean()
        c.save()
        assert c.pk is not None

    def test_coupon_invalid_code_lowercase(self):
        c = Coupon(code='promo1', brand='laundrygo', discount_percentage=Decimal('10.00'))
        with pytest.raises(DjangoValidationError):
            c.full_clean()

    def test_coupon_invalid_code_length(self):
        c = Coupon(code='SAVE5', brand='laundrygo', discount_percentage=Decimal('10.00'))
        with pytest.raises(DjangoValidationError):
            c.full_clean()

        c2 = Coupon(code='SAVE2026', brand='laundrygo', discount_percentage=Decimal('10.00'))
        with pytest.raises(DjangoValidationError):
            c2.full_clean()

    def test_coupon_invalid_code_characters(self):
        c = Coupon(code='SAV-20', brand='laundrygo', discount_percentage=Decimal('10.00'))
        with pytest.raises(DjangoValidationError):
            c.full_clean()

    def test_unique_code_per_brand(self, laundry_coupon):
        # Same code for different brand is allowed
        c_gpc = Coupon(code='SAVE20', brand='gopropertycare', discount_percentage=Decimal('20.00'))
        c_gpc.full_clean()
        c_gpc.save()
        assert c_gpc.pk is not None

        # Duplicate code for same brand is rejected
        with pytest.raises(Exception):
            Coupon.objects.create(code='SAVE20', brand='laundrygo', discount_percentage=Decimal('10.00'))


@pytest.mark.django_db
class TestCouponValidationEndpoint:
    def test_unauthenticated_user_rejected(self, api_client, laundry_coupon):
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'SAVE20',
            'brand': 'laundrygo',
        }, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_validate_success(self, api_client, regular_user, laundry_coupon):
        api_client.force_authenticate(user=regular_user)
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'SAVE20',
            'brand': 'laundrygo',
        }, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] is True
        assert response.data['code'] == 'SAVE20'
        assert float(response.data['discount_percentage']) == 20.0

    def test_validate_case_insensitive_input(self, api_client, regular_user, laundry_coupon):
        api_client.force_authenticate(user=regular_user)
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'save20',
            'brand': 'laundrygo',
        }, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == 'SAVE20'

    def test_validate_inactive_coupon(self, api_client, regular_user, laundry_coupon):
        laundry_coupon.is_active = False
        laundry_coupon.save()

        api_client.force_authenticate(user=regular_user)
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'SAVE20',
            'brand': 'laundrygo',
        }, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_validate_wrong_brand(self, api_client, regular_user, laundry_coupon):
        api_client.force_authenticate(user=regular_user)
        # Laundry coupon tried against gopropertycare
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'SAVE20',
            'brand': 'gopropertycare',
        }, format='json')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_validate_already_used_coupon(self, api_client, regular_user, laundry_coupon):
        # Record usage
        CouponUsage.objects.create(
            coupon=laundry_coupon,
            user=regular_user,
            brand='laundrygo',
            order_id=1,
            order_type='laundry',
            discount_amount=Decimal('8.00'),
        )

        api_client.force_authenticate(user=regular_user)
        response = api_client.post('/api/v1/coupons/validate/', {
            'code': 'SAVE20',
            'brand': 'laundrygo',
        }, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data['error'] == 'already_used'


@pytest.mark.django_db
class TestOrderCouponRedemption:
    def test_laundry_order_with_coupon(self, api_client, regular_user, laundry_rate, laundry_coupon):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()
        api_client.force_authenticate(user=regular_user)
        payload = {
            'service_rate': laundry_rate.id,
            'pickup_date': tomorrow,
            'pickup_time_slot': 'morning',
            'order_details': '2 bags of mixed laundry',
            'street_address': '123 Main St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'delivery_fee': 0.00,
            'frequency': 'oneTime',
            'coupon_code': 'SAVE20',
        }
        response = api_client.post('/api/v1/orders/', payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data

        # Estimated base: 20 lbs * $2.25/lb = $45.00
        # 20% discount = $9.00 discount -> total_price = $36.00
        assert data['coupon_code'] == 'SAVE20'
        assert float(data['discount_percentage']) == 20.0
        assert float(data['discount_amount']) == 9.0
        assert float(data['total_price']) == 36.0

        # Verify CouponUsage record created
        assert CouponUsage.objects.filter(coupon=laundry_coupon, user=regular_user).exists()

        # Second attempt should fail
        response2 = api_client.post('/api/v1/orders/', payload, format='json')
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert 'coupon_code' in response2.data

    def test_laundry_guest_cannot_use_coupon(self, api_client, laundry_rate, laundry_coupon):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()
        payload = {
            'service_rate': laundry_rate.id,
            'guest_email': 'guest@example.com',
            'guest_first_name': 'Guest',
            'guest_last_name': 'User',
            'guest_phone': '3035550199',
            'order_details': '2 bags of mixed laundry',
            'pickup_date': tomorrow,
            'pickup_time_slot': 'morning',
            'street_address': '123 Main St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'delivery_fee': 0.00,
            'frequency': 'oneTime',
            'coupon_code': 'SAVE20',
        }
        response = api_client.post('/api/v1/orders/', payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'coupon_code' in response.data


@pytest.mark.django_db
class TestCleaningOrderCouponRedemption:
    def test_gpc_order_with_coupon(self, api_client, regular_user, cleaning_rate, gpc_coupon):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()
        api_client.force_authenticate(user=regular_user)
        payload = {
            'brand': 'gopropertycare',
            'service_rate_id': cleaning_rate.id,
            'square_feet': 1000,
            'bedrooms': 2,
            'bathrooms': 1,
            'is_occupied': True,
            'entry_method': 'someone_home',
            'service_date': tomorrow,
            'time_slot': 'morning',
            'street_address': '456 Elm St',
            'city': 'Denver',
            'zip_code': '80203',
            'delivery_zone': 'inner',
            'coupon_code': 'GPC100',
            'payment_method_id': 'pm_card_visa',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data

        # 1000 sq ft residential standard:
        assert data['coupon_code'] == 'GPC100'
        assert float(data['discount_percentage']) == 15.0
        assert float(data['discount_amount']) > 0
        assert float(data['total_price']) == float(data['base_price']) - float(data['discount_amount'])
        assert float(data['deposit_amount']) == round(float(data['total_price']) * 0.25, 2)
        assert float(data['remaining_balance']) == round(float(data['total_price']) - float(data['deposit_amount']), 2)

        # Verify CouponUsage record created
        assert CouponUsage.objects.filter(coupon=gpc_coupon, user=regular_user).exists()

        # Second attempt should fail
        response2 = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert 'coupon_code' in response2.data

    def test_gpc_second_user_can_use_coupon(self, api_client, second_user, cleaning_rate, gpc_coupon):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        api_client.force_authenticate(user=second_user)
        payload = {
            'brand': 'gopropertycare',
            'service_rate_id': cleaning_rate.id,
            'square_feet': 1000,
            'bedrooms': 2,
            'bathrooms': 1,
            'is_occupied': True,
            'entry_method': 'someone_home',
            'service_date': tomorrow,
            'time_slot': 'afternoon',
            'street_address': '789 Oak St',
            'city': 'Denver',
            'zip_code': '80204',
            'delivery_zone': 'inner',
            'coupon_code': 'GPC100',
            'payment_method_id': 'pm_card_visa',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert CouponUsage.objects.filter(coupon=gpc_coupon, user=second_user).exists()
