from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.cleaning.models import CleaningServiceRate, CleaningAddon


class Command(BaseCommand):
    help = 'Seeds initial GoPropertyCare cleaning rates and property add-ons'

    def handle(self, *args, **kwargs):
        rates_data = [
            {
                'name': 'Limpieza Regular',
                'service_type': 'regular',
                'rate_per_sqft': Decimal('0.10'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Cuidado y limpieza estándar para residencias y comercios. Mantenimiento preventivo, desinfección de superficies, baños, cocina y pisos.',
            },
            {
                'name': 'Limpieza Profunda (GoFurther)',
                'service_type': 'deep',
                'rate_per_sqft': Decimal('0.16'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza exhaustiva con desincrustación profunda, zócalos, juntas y suciedad acumulada.',
            },
            {
                'name': 'Limpieza MoveIn/MoveOut',
                'service_type': 'move_in_out',
                'rate_per_sqft': Decimal('0.20'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza completa y detallada para entrega o recibimiento de propiedades impecables para mudanza.',
            },
            {
                'name': 'Limpieza Post-Construcción',
                'service_type': 'post_construction',
                'rate_per_sqft': Decimal('0.26'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza de máximo nivel con aspirado de grado industrial, remoción de polvo fino de obra y restos de pintura tras remodelaciones.',
            },
            {
                'name': 'Limpieza Comercial / Janitorial',
                'service_type': 'commercial',
                'rate_per_sqft': Decimal('0.18'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Servicio profesional para oficinas, comercios y locales. Desinfección integral, áreas comunes, sanitarios y pisos.',
            },
            {
                'name': 'Demolición de Drywall y Mano de Obra Industrial',
                'service_type': 'industrial_demolition',
                'rate_per_sqft': Decimal('0.35'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Mano de obra especializada para demolición selectiva de tablaroca/drywall, retiro de escombros y soporte en sitio 100% asegurado.',
            },
        ]

        addons_data = [
            {
                'code': 'pets_presence',
                'name': 'Presencia de Mascotas',
                'price': Decimal('35.00'),
                'description': 'Tratamiento especial de pelos, caspa y eliminación de olores en tapicería y pisos.',
            },
            {
                'code': 'high_ceilings',
                'name': 'Techos Altos / Ventanales',
                'price': Decimal('30.00'),
                'description': 'Limpieza de cornisas, lámparas elevadas y ventanales con equipo telescópico.',
            },
            {
                'code': 'oven_fridge_interior',
                'name': 'Interior de Horno y Refrigerador',
                'price': Decimal('45.00'),
                'description': 'Desengrasado térmico profundo y desinfección total de interiores de electrodomésticos.',
            },
            {
                'code': 'cabinets_interior',
                'name': 'Interior de Alacenas y Gabinetes',
                'price': Decimal('35.00'),
                'description': 'Desocupar, aspirar residuos y desinfectar cajones y estantes de cocina y baños.',
            },
            {
                'code': 'basement_attic',
                'name': 'Sótano Terminado / Ático',
                'price': Decimal('50.00'),
                'description': 'Inclusión de área adicional terminada en el plan de limpieza.',
            },
            {
                'code': 'patio_balcony',
                'name': 'Balcón o Patio Exterior',
                'price': Decimal('25.00'),
                'description': 'Barrido, lavado y remoción de polvo y hojas en área exterior inmediata.',
            },
        ]

        # Seed Service Rates
        for rate in rates_data:
            obj, created = CleaningServiceRate.objects.update_or_create(
                service_type=rate['service_type'],
                defaults=rate
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Cleaning Rate: {obj.name} (${obj.rate_per_sqft}/sqft, min ${obj.min_order_amount})'))

        # Seed Add-ons
        for addon in addons_data:
            obj, created = CleaningAddon.objects.update_or_create(
                code=addon['code'],
                defaults=addon
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Cleaning Addon: {obj.name} (+${obj.price})'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all GoPropertyCare cleaning rates and add-ons!'))
