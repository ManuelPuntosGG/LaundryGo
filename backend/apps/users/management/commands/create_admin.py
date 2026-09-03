from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with all required fields'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default=config('DJANGO_SUPERUSER_EMAIL', default='admin@laundrygo.com')
        )
        parser.add_argument(
            '--password',
            type=str,
            default=config('DJANGO_SUPERUSER_PASSWORD', default='admin123')
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Superuser {email} already exists.'))
            return

        user = User.objects.create_superuser(
            username=email.split('@')[0],
            email=email,
            password=password,
            first_name='Admin',
            last_name='User',
            phone='3035550123',
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser created successfully: {user.email}'))
