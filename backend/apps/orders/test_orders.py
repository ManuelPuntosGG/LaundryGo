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
            rate_per_lb=2.45,
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

    def test_biweekly_recurring_schedule_creation(self):
        """Test biweekly frequency schedules are created with a 14-day gap."""
        self.client.force_authenticate(user=self.user)
        today = timezone.localtime(timezone.now()).date()
        tomorrow = today + timedelta(days=1)

        payload = {
            'service_rate': self.standard_rate.id,
            'pickup_date': tomorrow.isoformat(),
            'pickup_time_slot': 'morning',
            'order_details': 'Biweekly towels service',
            'street_address': self.user.street_address,
            'city': self.user.city,
            'zip_code': self.user.zip_code,
            'frequency': 'biweekly',
        }

        response = self.client.post(self.orders_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        schedule = RecurringSchedule.objects.get(user=self.user)
        self.assertEqual(schedule.frequency, 'biweekly')
        self.assertEqual(schedule.next_pickup_date, tomorrow + timedelta(weeks=2))

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

    def test_cancel_pending_order_success(self):
        """Test user can cancel their own pending order."""
        self.client.force_authenticate(user=self.user)
        today = timezone.localtime(timezone.now()).date()

        order = Order.objects.create(
            user=self.user,
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Pending order to cancel',
            status='pending'
        )

        schedule = RecurringSchedule.objects.create(
            user=self.user,
            order=order,
            frequency='weekly',
            is_active=True,
            next_pickup_date=today + timedelta(days=7)
        )

        cancel_url = f'/api/v1/orders/{order.id}/cancel/'
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')
        
        schedule.refresh_from_db()
        self.assertFalse(schedule.is_active)

    def test_cancel_processing_order_rejected(self):
        """Test user cannot cancel an order in processing status."""
        self.client.force_authenticate(user=self.user)
        today = timezone.localtime(timezone.now()).date()

        order = Order.objects.create(
            user=self.user,
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Processing order',
            status='processing'
        )

        cancel_url = f'/api/v1/orders/{order.id}/cancel/'
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

        order.refresh_from_db()
        self.assertEqual(order.status, 'processing')

    def test_cancel_other_user_order_forbidden(self):
        """Test user cannot cancel another user's order."""
        other_user = User.objects.create_user(
            username='other@example.com',
            email='other@example.com',
            password='Password123!'
        )
        today = timezone.localtime(timezone.now()).date()

        order = Order.objects.create(
            user=other_user,
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Other user order',
            status='pending'
        )

        self.client.force_authenticate(user=self.user)
        cancel_url = f'/api/v1/orders/{order.id}/cancel/'
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        order.refresh_from_db()
        self.assertEqual(order.status, 'pending')

    def test_guest_orders_auto_linked_on_registration(self):
        """Test past orders made with a guest email are automatically linked when user registers."""
        guest_email = 'new.registered@example.com'
        today = timezone.localtime(timezone.now()).date()

        # Guest creates an order
        guest_order = Order.objects.create(
            user=None,
            guest_email=guest_email,
            guest_first_name='Laura',
            guest_last_name='Perez',
            guest_phone='3035559999',
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Guest towels',
            status='pending'
        )

        self.assertIsNone(guest_order.user)

        # Now Laura registers with that email
        register_url = '/api/v1/auth/register/'
        reg_payload = {
            'email': guest_email,
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'first_name': 'Laura',
            'last_name': 'Perez',
            'phone': '3035559999',
            'street_address': '800 18th St',
            'city': 'Denver',
            'zip_code': '80202',
        }

        response = self.client.post(register_url, reg_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        guest_order.refresh_from_db()
        self.assertIsNotNone(guest_order.user)
        self.assertEqual(guest_order.user.email, guest_email)

    def test_order_confirmation_and_cancellation_emails(self):
        """Test that send_order_confirmation_email and send_order_cancellation_email execute without error."""
        from django.core import mail
        from apps.orders.emails import send_order_confirmation_email, send_order_cancellation_email
        import time

        today = timezone.localtime(timezone.now()).date()
        order = Order.objects.create(
            user=self.user,
            service_rate=self.standard_rate,
            pickup_date=today,
            pickup_time_slot='morning',
            order_details='Two bags of clothes, Downy scent beads',
            delivery_zone='inner',
            delivery_fee=0.0,
            status='pending'
        )

        initial_len = len(mail.outbox)
        send_order_confirmation_email(order)
        time.sleep(0.3)  # Allow background daemon thread to complete
        self.assertGreaterEqual(len(mail.outbox), initial_len)

        send_order_cancellation_email(order)
        time.sleep(0.3)
        self.assertGreaterEqual(len(mail.outbox), initial_len)


