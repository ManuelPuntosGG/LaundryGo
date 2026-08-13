from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with all required fields'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@laundrygo.com')
        parser.add_argument('--password', type=str, default='admin123')

    def handle(self, *args, **options):
        if User.objects.filter(email=options['email']).exists():
            self.stdout.write(self.style.WARNING(f'User {options["email"]} already exists'))
            return

        user = User.objects.create_superuser(
            username='admin',
            email=options['email'],
            password=options['password'],
            first_name='Admin',
            last_name='User',
            phone='3035550123',
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser created: {user.email}'))
