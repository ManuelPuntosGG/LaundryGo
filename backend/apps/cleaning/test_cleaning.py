import pytest
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.cleaning.models import CleaningServiceRate, CleaningPricingTier, CleaningAddon, CleaningOrder

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def regular_rate(db):
    return CleaningServiceRate.objects.create(
        name='Limpieza Regular',
        service_type='regular',
        brand='gopropertycare',
        rate_per_sqft=Decimal('0.10'),
        min_order_amount=Decimal('99.00'),
        description='Standard residential cleaning',
        is_active=True,
    )


@pytest.fixture
def commercial_rate(db):
    return CleaningServiceRate.objects.create(
        name='Limpieza Comercial',
        service_type='commercial',
        brand='evolvingsolutions',
        rate_per_sqft=Decimal('0.18'),
        min_order_amount=Decimal('99.00'),
        description='Commercial janitorial',
        is_active=True,
    )


@pytest.fixture
def post_construction_rate(db):
    return CleaningServiceRate.objects.create(
        name='Limpieza Post-Construcción',
        service_type='post_construction',
        brand='evolvingsolutions',
        rate_per_sqft=Decimal('0.26'),
        min_order_amount=Decimal('99.00'),
        description='Post-construction cleaning',
        is_active=True,
    )


@pytest.fixture
def pet_addon(db):
    return CleaningAddon.objects.create(
        name='Presencia de Mascotas',
        code='pets_presence',
        brand='gopropertycare',
        price=Decimal('35.00'),
        description='Tratamiento de pelos',
        is_active=True,
    )


@pytest.fixture
def commercial_addon(db):
    return CleaningAddon.objects.create(
        name='Lavado Mecanizado de Pisos Industriales',
        code='floor_machine_scrub',
        brand='evolvingsolutions',
        price=Decimal('65.00'),
        description='Pulido y fregado con máquina industrial',
        is_active=True,
    )


@pytest.fixture
def sample_user(db):
    return User.objects.create_user(
        username='cleaninguser@example.com',
        email='cleaninguser@example.com',
        password='StrongPassword123!',
        first_name='Carlos',
        last_name='Perez',
        phone='7205550199',
    )


@pytest.mark.django_db
class TestCleaningAPI:
    def test_get_cleaning_rates(self, api_client, regular_rate):
        response = api_client.get('/api/v1/cleaning/rates/')
        assert response.status_code == 200
        data = response.json()
        rates = data if isinstance(data, list) else data.get('results', [])
        assert len(rates) >= 1
        assert rates[0]['service_type'] == 'regular'
        assert float(rates[0]['rate_per_sqft']) == 0.1

    def test_get_cleaning_addons(self, api_client, pet_addon):
        response = api_client.get('/api/v1/cleaning/addons/')
        assert response.status_code == 200
        data = response.json()
        addons = data if isinstance(data, list) else data.get('results', [])
        assert len(addons) >= 1
        assert addons[0]['code'] == 'pets_presence'
        assert float(addons[0]['price']) == 35.0

    def test_get_available_dates_before_and_after_noon(self, api_client):
        from unittest.mock import patch
        from datetime import datetime
        tz = timezone.get_current_timezone()
        # Mock 10:00 AM (before 12 PM cutoff)
        morning_dt = timezone.make_aware(datetime(2026, 6, 1, 10, 0, 0), tz)
        with patch('django.utils.timezone.now', return_value=morning_dt):
            response = api_client.get('/api/v1/cleaning/schedule/available-dates/')
            assert response.status_code == 200
            dates = response.json()
            assert len(dates) == 61
            assert dates[0]['date'] == '2026-06-01'
            assert dates[0]['is_today'] is True

        # Mock 1:00 PM (after 12 PM cutoff)
        afternoon_dt = timezone.make_aware(datetime(2026, 6, 1, 13, 0, 0), tz)
        with patch('django.utils.timezone.now', return_value=afternoon_dt):
            response = api_client.get('/api/v1/cleaning/schedule/available-dates/')
            assert response.status_code == 200
            dates = response.json()
            assert len(dates) == 60
            assert dates[0]['date'] == '2026-06-02'
            assert dates[0]['is_today'] is False

    def test_create_guest_order_with_min_order(self, api_client, regular_rate):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()
        payload = {
            'guest_email': 'guest@example.com',
            'guest_first_name': 'Maria',
            'guest_last_name': 'Gomez',
            'guest_phone': '7205559988',
            'street_address': '123 Main St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': regular_rate.id,
            'square_feet': 500,  # 500 * 0.10 = $50.00, below min order $99.00
            'service_date': tomorrow,
            'time_slot': 'morning',
            'special_instructions': 'Gate code 1234',
            'language': 'es',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 201
        order = CleaningOrder.objects.get(guest_email='guest@example.com')
        assert order.base_price == Decimal('99.00')  # Minimum applied
        assert order.delivery_fee == Decimal('0.00')
        assert order.total_price == Decimal('99.00')
        assert order.status == 'pending'
        assert order.language == 'es'

    def test_create_guest_order_large_with_addons_and_outer_zone(self, api_client, regular_rate, pet_addon):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        payload = {
            'guest_email': 'guest_aurora@example.com',
            'guest_first_name': 'John',
            'guest_last_name': 'Smith',
            'guest_phone': '3035551234',
            'street_address': '456 Elm St',
            'city': 'Aurora',
            'zip_code': '80012',
            'delivery_zone': 'outer',  # +$25
            'service_rate_id': regular_rate.id,
            'square_feet': 2000,  # 2000 * 0.10 = $200.00
            'selected_addons': [
                {'code': pet_addon.code, 'name': pet_addon.name, 'price': 35.00}
            ],
            'service_date': tomorrow,
            'time_slot': 'afternoon',
            'language': 'en',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 201
        order = CleaningOrder.objects.get(guest_email='guest_aurora@example.com')
        assert order.base_price == Decimal('200.00')
        assert order.addons_total == Decimal('35.00')
        assert order.delivery_fee == Decimal('25.00')
        assert order.total_price == Decimal('260.00')  # 200 + 35 + 25

    def test_same_day_order_rules(self, api_client, regular_rate):
        from unittest.mock import patch
        from datetime import datetime
        tz = timezone.get_current_timezone()

        # 1. After 12 PM: same-day rejected
        afternoon_dt = timezone.make_aware(datetime(2026, 6, 1, 13, 0, 0), tz)
        with patch('django.utils.timezone.now', return_value=afternoon_dt):
            payload = {
                'guest_email': 'sameday@example.com',
                'guest_first_name': 'Test',
                'guest_last_name': 'User',
                'guest_phone': '3035550000',
                'street_address': '789 Pine St',
                'city': 'Denver',
                'zip_code': '80203',
                'delivery_zone': 'inner',
                'service_rate_id': regular_rate.id,
                'square_feet': 1200,
                'service_date': '2026-06-01',
                'time_slot': '04:30 PM',
            }
            resp = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
            assert resp.status_code == 400
            assert 'service_date' in resp.json()

        # 2. Before 12 PM but arrival is less than 3 hours from now: rejected
        morning_dt = timezone.make_aware(datetime(2026, 6, 1, 10, 0, 0), tz)
        with patch('django.utils.timezone.now', return_value=morning_dt):
            payload = {
                'guest_email': 'sameday@example.com',
                'guest_first_name': 'Test',
                'guest_last_name': 'User',
                'guest_phone': '3035550000',
                'street_address': '789 Pine St',
                'city': 'Denver',
                'zip_code': '80203',
                'delivery_zone': 'inner',
                'service_rate_id': regular_rate.id,
                'square_feet': 1200,
                'service_date': '2026-06-01',
                'time_slot': '11:30 AM',  # only 1.5h notice
            }
            resp = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
            assert resp.status_code == 400
            assert 'time_slot' in resp.json()

        # 3. Before 12 PM with >= 3 hours notice: accepted!
        with patch('django.utils.timezone.now', return_value=morning_dt):
            payload = {
                'guest_email': 'sameday_ok@example.com',
                'guest_first_name': 'Test',
                'guest_last_name': 'User',
                'guest_phone': '3035550000',
                'street_address': '789 Pine St',
                'city': 'Denver',
                'zip_code': '80203',
                'delivery_zone': 'inner',
                'service_rate_id': regular_rate.id,
                'square_feet': 1200,
                'service_date': '2026-06-01',
                'time_slot': '02:00 PM',  # 4h notice
                'bedrooms': 3,
                'bathrooms': 2.0,
                'is_occupied': True,
                'entry_method': 'keypad',
                'entry_notes': 'Code 4432',
            }
            resp = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
            assert resp.status_code == 201
            order = CleaningOrder.objects.get(guest_email='sameday_ok@example.com')
            assert order.bedrooms == 3
            assert order.entry_method == 'keypad'

    def test_authenticated_user_order_and_cancel(self, api_client, regular_rate, sample_user):
        api_client.force_authenticate(user=sample_user)
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=3)).isoformat()
        payload = {
            'street_address': '999 Broadway',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': regular_rate.id,
            'square_feet': 1500,  # 1500 * 0.10 = $150.00
            'service_date': tomorrow,
            'time_slot': 'morning',
            'language': 'es',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 201
        order_id = response.json()['id']

        # List user orders
        list_resp = api_client.get('/api/v1/cleaning/orders/')
        assert list_resp.status_code == 200
        orders = list_resp.json() if isinstance(list_resp.json(), list) else list_resp.json().get('results', [])
        assert any(o['id'] == order_id for o in orders)

        # Cancel order
        cancel_resp = api_client.post(f'/api/v1/cleaning/orders/{order_id}/cancel/')
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()['status'] == 'cancelled'

    def test_create_evolvingsolutions_order(self, api_client, commercial_rate):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        payload = {
            'guest_email': 'contractor@example.com',
            'guest_first_name': 'Robert',
            'guest_last_name': 'Miller',
            'guest_phone': '7205558899',
            'street_address': '500 16th St Mall',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': commercial_rate.id,
            'square_feet': 3000,
            'service_date': tomorrow,
            'time_slot': 'morning',
            'brand': 'evolvingsolutions',
            'special_instructions': 'Security check-in at dock 2',
            'language': 'en',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 201
        order = CleaningOrder.objects.get(guest_email='contractor@example.com')
        assert order.brand == 'evolvingsolutions'
        assert str(order).startswith('ESL-#')
        assert order.total_price == Decimal('540.00')  # 3000 * 0.18 = $540.00

    def test_cross_brand_rate_rejected_on_gopropertycare(self, api_client, post_construction_rate):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        payload = {
            'guest_email': 'residential_user@example.com',
            'guest_first_name': 'Alice',
            'guest_last_name': 'Walker',
            'guest_phone': '7205551122',
            'street_address': '123 Pine St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': post_construction_rate.id,
            'square_feet': 1500,
            'service_date': tomorrow,
            'time_slot': 'morning',
            'brand': 'gopropertycare',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 400
        assert 'service_rate_id' in response.json()
        error_msg = str(response.json()['service_rate_id'])
        assert 'does not belong to GoPropertyCare' in error_msg

    def test_cross_brand_rate_rejected_on_evolvingsolutions(self, api_client, regular_rate):
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        payload = {
            'guest_email': 'biz_user@example.com',
            'guest_first_name': 'John',
            'guest_last_name': 'Doe',
            'guest_phone': '7205553344',
            'street_address': '456 Market St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': regular_rate.id,
            'square_feet': 2000,
            'service_date': tomorrow,
            'time_slot': 'morning',
            'brand': 'evolvingsolutions',
        }
        response = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert response.status_code == 400
        assert 'service_rate_id' in response.json()
        error_msg = str(response.json()['service_rate_id'])
        assert 'does not belong to Evolving Solutions LLC' in error_msg

    def test_rates_filter_by_brand(self, api_client, regular_rate, commercial_rate, post_construction_rate):
        # Filter for GoPropertyCare
        gpc_resp = api_client.get('/api/v1/cleaning/rates/?brand=gopropertycare')
        assert gpc_resp.status_code == 200
        gpc_data = gpc_resp.json() if isinstance(gpc_resp.json(), list) else gpc_resp.json().get('results', [])
        assert any(r['service_type'] == 'regular' for r in gpc_data)
        assert not any(r['service_type'] == 'post_construction' for r in gpc_data)
        assert not any(r['service_type'] == 'commercial' for r in gpc_data)

        # Filter for Evolving Solutions
        esl_resp = api_client.get('/api/v1/cleaning/rates/?brand=evolvingsolutions')
        assert esl_resp.status_code == 200
        esl_data = esl_resp.json() if isinstance(esl_resp.json(), list) else esl_resp.json().get('results', [])
        assert any(r['service_type'] == 'commercial' for r in esl_data)
        assert any(r['service_type'] == 'post_construction' for r in esl_data)
        assert not any(r['service_type'] == 'regular' for r in esl_data)

    def test_addons_filter_by_brand(self, api_client, pet_addon, commercial_addon):
        # GoPropertyCare addons
        gpc_resp = api_client.get('/api/v1/cleaning/addons/?brand=gopropertycare')
        assert gpc_resp.status_code == 200
        gpc_data = gpc_resp.json() if isinstance(gpc_resp.json(), list) else gpc_resp.json().get('results', [])
        assert any(a['code'] == 'pets_presence' for a in gpc_data)
        assert not any(a['code'] == 'floor_machine_scrub' for a in gpc_data)

        # Evolving Solutions addons
        esl_resp = api_client.get('/api/v1/cleaning/addons/?brand=evolvingsolutions')
        assert esl_resp.status_code == 200
        esl_data = esl_resp.json() if isinstance(esl_resp.json(), list) else esl_resp.json().get('results', [])
        assert any(a['code'] == 'floor_machine_scrub' for a in esl_data)
        assert not any(a['code'] == 'pets_presence' for a in esl_data)

    def test_user_orders_filter_by_brand(self, api_client, regular_rate, commercial_rate, sample_user):
        api_client.force_authenticate(user=sample_user)
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()

        # Create GPC order
        api_client.post('/api/v1/cleaning/orders/', {
            'street_address': '100 Home Ave',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': regular_rate.id,
            'square_feet': 1000,
            'service_date': tomorrow,
            'time_slot': 'morning',
            'brand': 'gopropertycare',
        }, format='json')

        # Create ESL order
        api_client.post('/api/v1/cleaning/orders/', {
            'street_address': '200 Commercial Way',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': commercial_rate.id,
            'square_feet': 2000,
            'service_date': tomorrow,
            'time_slot': 'afternoon',
            'brand': 'evolvingsolutions',
        }, format='json')

        # Fetch only GPC orders
        gpc_orders = api_client.get('/api/v1/cleaning/orders/?brand=gopropertycare').json()
        if not isinstance(gpc_orders, list):
            gpc_orders = gpc_orders.get('results', [])
        assert len(gpc_orders) == 1
        assert gpc_orders[0]['brand'] == 'gopropertycare'

        # Fetch only ESL orders
        esl_orders = api_client.get('/api/v1/cleaning/orders/?brand=evolvingsolutions').json()
        if not isinstance(esl_orders, list):
            esl_orders = esl_orders.get('results', [])
        assert len(esl_orders) == 1
        assert esl_orders[0]['brand'] == 'evolvingsolutions'


@pytest.mark.django_db
class TestCleaningPricingTiers:
    def test_cleaning_pricing_tiers_list_endpoint(self, api_client):
        CleaningPricingTier.objects.create(
            brand='gopropertycare',
            tier_number=1,
            label='500 – 999 sq ft',
            min_sqft=500,
            max_sqft=999,
            standard_price=Decimal('160.00'),
            deep_price=Decimal('215.00'),
            str_on_site_price=Decimal('185.00'),
            str_off_site_price=Decimal('245.00'),
        )
        CleaningPricingTier.objects.create(
            brand='gopropertycare',
            tier_number=2,
            label='1,000 – 1,299 sq ft',
            min_sqft=1000,
            max_sqft=1299,
            standard_price=Decimal('210.00'),
            deep_price=Decimal('275.00'),
            str_on_site_price=Decimal('240.00'),
            str_off_site_price=Decimal('315.00'),
        )

        resp = api_client.get('/api/v1/cleaning/tiers/?brand=gopropertycare')
        assert resp.status_code == 200
        data = resp.json()
        results = data if isinstance(data, list) else data.get('results', [])
        assert len(results) == 2
        assert results[0]['tier_number'] == 1
        assert results[0]['label'] == '500 – 999 sq ft'
        assert Decimal(str(results[0]['standard_price'])) == Decimal('160.00')

    def test_pricing_tier_order_price_calculation(self, api_client, regular_rate):
        # Create a tier with custom admin price (e.g. standard_price = 199.00 instead of default 160.00)
        CleaningPricingTier.objects.create(
            brand='gopropertycare',
            tier_number=1,
            label='500 – 999 sq ft',
            min_sqft=500,
            max_sqft=999,
            standard_price=Decimal('199.00'),
            deep_price=Decimal('259.00'),
            str_on_site_price=Decimal('220.00'),
            str_off_site_price=Decimal('270.00'),
        )

        future_date = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        payload = {
            'street_address': '555 Custom Price St',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': regular_rate.id,
            'square_feet': 750,
            'frequency': 'one_time',
            'bedrooms': 2,
            'bathrooms': 1.5,
            'is_occupied': True,
            'entry_method': 'someone_home',
            'service_date': future_date,
            'time_slot': '09:00 AM',
            'guest_email': 'customtier@example.com',
            'guest_first_name': 'Jane',
            'guest_last_name': 'Doe',
            'guest_phone': '303-555-9876',
            'brand': 'gopropertycare',
        }
        resp = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert resp.status_code == 201
        data = resp.json()
        # Should use the admin-customized standard_price of 199.00 for 750 sqft (tier 1)
        assert Decimal(str(data['base_price'])) == Decimal('199.00')
        assert Decimal(str(data['total_price'])) == Decimal('199.00')

    def test_str_order_with_offsite_laundry_addon(self, api_client, db):
        str_rate = CleaningServiceRate.objects.create(
            name='Short-Term Rental Turnover',
            service_type='str_on_site',
            brand='gopropertycare',
            rate_per_sqft=Decimal('0.17'),
            min_order_amount=Decimal('99.00'),
            description='STR Turnover',
            is_active=True,
        )

        future_date = (timezone.localtime(timezone.now()).date() + timedelta(days=2)).isoformat()
        # 2 bedrooms ($135 base, 2 inc baths, external laundry $70)
        # 3 bathrooms (1 extra bath = +$25) -> baseBeforeDisc = $160.00
        # biweekly discount: 15% off $160 = $24.00 -> base_price = $136.00
        # off_site_laundry addon: $70.00
        # Total price: $136.00 + $70.00 = $206.00
        payload = {
            'street_address': '123 STR Test Blvd',
            'city': 'Denver',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'service_rate_id': str_rate.id,
            'square_feet': 1200,
            'frequency': 'biweekly',
            'bedrooms': 2,
            'bathrooms': 3,
            'is_occupied': True,
            'entry_method': 'lockbox',
            'entry_notes': 'Code: 1234',
            'selected_addons': [
                {
                    'code': 'off_site_laundry',
                    'name': 'Off-Site Laundry Service',
                    'price': 70.00,
                }
            ],
            'service_date': future_date,
            'time_slot': '10:00 AM',
            'guest_email': 'strhost@example.com',
            'guest_first_name': 'Host',
            'guest_last_name': 'Denver',
            'guest_phone': '720-555-4321',
            'brand': 'gopropertycare',
        }
        resp = api_client.post('/api/v1/cleaning/orders/', payload, format='json')
        assert resp.status_code == 201
        data = resp.json()
        assert Decimal(str(data['base_price'])) == Decimal('136.00')
        assert Decimal(str(data['addons_total'])) == Decimal('70.00')
        assert Decimal(str(data['total_price'])) == Decimal('206.00')


