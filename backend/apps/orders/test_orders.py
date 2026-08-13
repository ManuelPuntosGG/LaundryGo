from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.orders.models import ServiceRate, Order, RecurringSchedule

User = get_user_model()


class OrderManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rates_url = '/api/v1/services/rates/'
        self.available_dates_url = '/api/v1/schedule/available-dates/'
        self.orders_url = '/api/v1/orders/'
        self.recurring_url = '/api/v1/recurring/'

        # Create test Service Rates
        self.standard_rate = ServiceRate.objects.create(
            name='Standard (2 days)',
            service_type='standard',
            rate_per_lb=2.25,
            delivery_days=2,
            description='Standard 2-day laundry turnaround'
        )
        self.go_rate = ServiceRate.objects.create(
            name='Go (Next day)',
            service_type='go',
            rate_per_lb=2.95,
            delivery_days=1,
            description='Fast next-day delivery'
        )
        self.gofurther_rate = ServiceRate.objects.create(
            name='GoFurther (Same day)',
            service_type='gofurther',
            rate_per_lb=3.85,
            delivery_days=0,
            description='Same-day express service'
        )

        self.user = User.objects.create_user(
            username='auth.customer@example.com',
            email='auth.customer@example.com',
            password='Password123!',
            first_name='Maria',
            last_name='Garcia',
            phone='3035558888',
            street_address='100 16th St',
            city='Denver',
            zip_code='80202',
        )

    def test_service_rates_list_endpoint(self):
        """Test retrieving list of active service rates."""
        response = self.client.get(self.rates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle paginated or list response
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 3)

    def test_available_dates_endpoint(self):
        """Test retrieving 30-day pickup availability calendar."""
        response = self.client.get(self.available_dates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 30)
        self.assertIn('date', results[0])
        self.assertIn('gofurther_available', results[0])

    def test_guest_order_creation_success(self):
        """Test guest user can place an order with valid contact info and Denver location."""
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()

        payload = {
            'service_rate': self.standard_rate.id,
            'pickup_date': tomorrow,
            'pickup_time_slot': 'morning',
            'order_details': '2 bags of darks and lights',
            'pickup_instructions': 'Leave at porch',
            'guest_email': 'guest.user@example.com',
            'guest_first_name': 'Carlos',
            'guest_last_name': 'Mendoza',
            'guest_phone': '3035551122',
            'street_address': '450 17th St',
            'city': 'Denver (Downtown / Central)',
            'zip_code': '80202',
            'delivery_zone': 'inner',
            'delivery_fee': 0.00,
            'frequency': 'oneTime',
        }

        response = self.client.post(self.orders_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)

        order = Order.objects.get(id=response.data['id'])
        self.assertIsNone(order.user)
        self.assertEqual(order.guest_email, 'guest.user@example.com')
        self.assertEqual(order.customer_name, 'Carlos Mendoza')

    def test_guest_order_missing_contact_info_fails(self):
        """Test guest order fails if email or phone is missing."""
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()

        payload = {
            'service_rate': self.standard_rate.id,
            'pickup_date': tomorrow,
            'pickup_time_slot': 'morning',
            'order_details': 'Missing guest contact info',
            'guest_email': '',
            'guest_first_name': '',
            'guest_last_name': '',
            'guest_phone': '',
            'street_address': '123 Test St',
        }

        response = self.client.post(self.orders_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_authenticated_user_order_creation(self):
        """Test authenticated user places order, auto-linked to user FK."""
        self.client.force_authenticate(user=self.user)
        tomorrow = (timezone.localtime(timezone.now()).date() + timedelta(days=1)).isoformat()

        payload = {
            'service_rate': self.go_rate.id,
            'pickup_date': tomorrow,
            'pickup_time_slot': 'afternoon',
            'order_details': 'Delicate dry cleaning items',
            'street_address': self.user.street_address,
            'city': self.user.city,
            'zip_code': self.user.zip_code,
            'frequency': 'weekly',
        }

        response = self.client.post(self.orders_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.customer_email, self.user.email)

        # Verify auto-created RecurringSchedule
        self.assertEqual(RecurringSchedule.objects.count(), 1)
        schedule = RecurringSchedule.objects.get(user=self.user)
        self.assertEqual(schedule.frequency, 'weekly')
        self.assertTrue(schedule.is_active)

    def test_past_date_order_rejection(self):
        """Test orders with past pickup dates are rejected."""
        past_date = (timezone.localtime(timezone.now()).date() - timedelta(days=1)).isoformat()

        payload = {
            'service_rate': self.standard_rate.id,
            'pickup_date': past_date,
            'pickup_time_slot': 'morning',
            'order_details': 'Past date test',
            'guest_email': 'test@example.com',
            'guest_first_name': 'Test',
            'guest_last_name': 'User',
            'guest_phone': '3035550000',
        }

        response = self.client.post(self.orders_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pickup_date', response.data)

    def test_recurring_schedule_deletion(self):
        """Test authenticated user can delete a recurring schedule."""
        self.client.force_authenticate(user=self.user)
        today = timezone.localtime(timezone.now()).date()

        order = Order.objects.create(
            user=self.user,
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Weekly towels'
        )

        schedule = RecurringSchedule.objects.create(
            user=self.user,
            order=order,
            frequency='weekly',
            is_active=True,
            next_pickup_date=today + timedelta(days=7)
        )

        detail_url = f'{self.recurring_url}{schedule.id}/'
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(RecurringSchedule.objects.filter(id=schedule.id).count(), 0)
