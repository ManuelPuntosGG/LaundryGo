from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.me_url = '/api/v1/auth/me/'

        self.user_data = {
            'email': 'john.doe@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '3035550123',
            'street_address': '1234 Blake St',
            'city': 'Denver',
            'zip_code': '80202',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
        }

    def test_user_registration_success(self):
        """Test successful user registration returns user data and JWT tokens."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
        self.assertEqual(response.data['user']['first_name'], self.user_data['first_name'])

        # Verify database record
        user = User.objects.get(email=self.user_data['email'])
        self.assertEqual(user.username, self.user_data['email'])

    def test_user_registration_password_mismatch(self):
        """Test registration fails when password and password_confirm do not match."""
        invalid_data = self.user_data.copy()
        invalid_data['password_confirm'] = 'DifferentPassword!'
        response = self.client.post(self.register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)

    def test_user_login_success(self):
        """Test authentication with valid email and password returns JWT tokens."""
        User.objects.create_user(
            username=self.user_data['email'],
            email=self.user_data['email'],
            password=self.user_data['password'],
            first_name=self.user_data['first_name'],
            last_name=self.user_data['last_name'],
        )

        login_payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password'],
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid password."""
        User.objects.create_user(
            username=self.user_data['email'],
            email=self.user_data['email'],
            password=self.user_data['password'],
        )

        login_payload = {
            'email': self.user_data['email'],
            'password': 'WrongPassword!',
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_current_user_profile_retrieval(self):
        """Test authenticated user can retrieve profile with address fields."""
        user = User.objects.create_user(
            username=self.user_data['email'],
            email=self.user_data['email'],
            password=self.user_data['password'],
            first_name='Jane',
            last_name='Smith',
            phone='3035559999',
            street_address='5678 Colfax Ave',
            city='Denver',
            zip_code='80204',
        )

        self.client.force_authenticate(user=user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'john.doe@example.com')
        self.assertEqual(response.data['first_name'], 'Jane')
        self.assertEqual(response.data['street_address'], '5678 Colfax Ave')
        self.assertEqual(response.data['city'], 'Denver')

    def test_token_blacklist_endpoint(self):
        """Test token blacklist endpoint invalidates refresh token."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        refresh_token = response.data['refresh']

        blacklist_response = self.client.post('/api/v1/auth/token/blacklist/', {'refresh': refresh_token}, format='json')
        self.assertEqual(blacklist_response.status_code, status.HTTP_200_OK)
