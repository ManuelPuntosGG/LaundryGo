from django.core.management.base import BaseCommand
from apps.orders.models import ServiceRate


class Command(BaseCommand):
    help = 'Seed initial service rates'

    def handle(self, *args, **options):
        rates = [
            {
                'name': 'Standard',
                'service_type': 'standard',
                'rate_per_lb': 2.25,
                'delivery_days': 2,
                'description': 'Standard delivery in 2 business days.',
            },
            {
                'name': 'Go',
                'service_type': 'go',
                'rate_per_lb': 2.45,
                'delivery_days': 1,
                'description': 'Next day delivery.',
            },
            {
                'name': 'GoFurther',
                'service_type': 'gofurther',
                'rate_per_lb': 3.85,
                'delivery_days': 0,
                'description': 'Same day delivery for orders placed before 12PM.',
            },
        ]

        for rate_data in rates:
            rate, created = ServiceRate.objects.update_or_create(
                service_type=rate_data['service_type'],
                defaults=rate_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{action}: {rate.name} - ${rate.rate_per_lb}/lb'))

        self.stdout.write(self.style.SUCCESS('Service rates seeded successfully!'))
