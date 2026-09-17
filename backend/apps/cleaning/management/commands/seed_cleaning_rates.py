from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.cleaning.models import CleaningServiceRate, CleaningAddon


class Command(BaseCommand):
    help = 'Seeds initial GoPropertyCare and Evolving Solutions cleaning rates and add-ons'

    def handle(self, *args, **kwargs):
        rates_data = [
            # GoPropertyCare (Residential only - No post construction)
            {
                'name': 'Limpieza Regular',
                'service_type': 'regular',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.10'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Cuidado y limpieza estándar para residencias particulares. Mantenimiento preventivo, desinfección de superficies, baños, cocina y pisos.',
            },
            {
                'name': 'Limpieza Profunda (GoFurther)',
                'service_type': 'deep',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.16'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza exhaustiva residencial con desincrustación profunda, zócalos, juntas y suciedad acumulada.',
            },
            {
                'name': 'Limpieza MoveIn/MoveOut',
                'service_type': 'move_in_out',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.20'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza completa y detallada para entrega o mudanza en viviendas y apartamentos.',
            },
            # Evolving Solutions LLC (Commercial, Post-Construction & Demolition)
            {
                'name': 'Limpieza Comercial / Janitorial',
                'service_type': 'commercial',
                'brand': 'evolvingsolutions',
                'rate_per_sqft': Decimal('0.18'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Servicio profesional para oficinas, comercios, bodegas y edificios corporativos. Desinfección integral, sanitarios, áreas comunes y pisos.',
            },
            {
                'name': 'Limpieza Post-Construcción',
                'service_type': 'post_construction',
                'brand': 'evolvingsolutions',
                'rate_per_sqft': Decimal('0.26'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Limpieza de grado industrial post-obra con aspirado HEPA, remoción de polvo fino de yeso, calcomanías y pintura tras obras o remodelaciones.',
            },
            {
                'name': 'Demolición de Drywall y Mano de Obra Industrial',
                'service_type': 'industrial_demolition',
                'brand': 'evolvingsolutions',
                'rate_per_sqft': Decimal('0.35'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Mano de obra especializada para demolición selectiva de tablaroca/drywall, retiro de escombros y soporte en sitio 100% asegurado.',
            },
        ]

        addons_data = [
            # GoPropertyCare Residential Add-ons
            {
                'code': 'pets_presence',
                'name': 'Presencia de Mascotas',
                'brand': 'gopropertycare',
                'price': Decimal('35.00'),
                'description': 'Tratamiento especial de pelos, caspa y eliminación de olores en tapicería y pisos.',
            },
            {
                'code': 'high_ceilings',
                'name': 'Techos Altos / Ventanales',
                'brand': 'gopropertycare',
                'price': Decimal('30.00'),
                'description': 'Limpieza de cornisas, lámparas elevadas y ventanales residenciales con equipo telescópico.',
            },
            {
                'code': 'oven_fridge_interior',
                'name': 'Interior de Horno y Refrigerador',
                'brand': 'gopropertycare',
                'price': Decimal('45.00'),
                'description': 'Desengrasado térmico profundo y desinfección total de interiores de electrodomésticos.',
            },
            {
                'code': 'cabinets_interior',
                'name': 'Interior de Alacenas y Gabinetes',
                'brand': 'gopropertycare',
                'price': Decimal('35.00'),
                'description': 'Desocupar, aspirar residuos y desinfectar cajones y estantes de cocina y baños.',
            },
            {
                'code': 'basement_attic',
                'name': 'Sótano Terminado / Ático',
                'brand': 'gopropertycare',
                'price': Decimal('50.00'),
                'description': 'Inclusión de área adicional terminada en el plan de limpieza.',
            },
            {
                'code': 'patio_balcony',
                'name': 'Balcón o Patio Exterior',
                'brand': 'gopropertycare',
                'price': Decimal('25.00'),
                'description': 'Barrido, lavado y remoción de polvo y hojas en área exterior inmediata.',
            },
            # Evolving Solutions LLC Commercial & Post-Construction Add-ons
            {
                'code': 'high_ceilings',
                'name': 'Techos Altos y Vigas Industriales',
                'brand': 'evolvingsolutions',
                'price': Decimal('45.00'),
                'description': 'Desempolvado y desinfección de ductos, vigas expuestas y luminarias elevadas de bodega u oficina.',
            },
            {
                'code': 'heavy_debris_haul',
                'name': 'Retiro y Carga de Escombros Pesados',
                'brand': 'evolvingsolutions',
                'price': Decimal('95.00'),
                'description': 'Acarreo de sacos de tablaroca, maderas, retazos y desechos de demolición hasta contenedor o volqueta.',
            },
            {
                'code': 'floor_machine_scrub',
                'name': 'Lavado Mecanizado de Pisos Industriales',
                'brand': 'evolvingsolutions',
                'price': Decimal('65.00'),
                'description': 'Pulido y fregado con máquina industrial de pisos de concreto pulido, epóxicos o baldosas comerciales.',
            },
            {
                'code': 'window_glass_commercial',
                'name': 'Lavado de Cristales y Fachadas Interiores',
                'brand': 'evolvingsolutions',
                'price': Decimal('55.00'),
                'description': 'Limpieza profunda de ventanales comerciales, mamparas de vidrio y vitrinas de piso a techo.',
            },
            {
                'code': 'restroom_deep_sanitization',
                'name': 'Desinfección Intensiva de Baterías de Baño',
                'brand': 'evolvingsolutions',
                'price': Decimal('45.00'),
                'description': 'Vaporización y tratamiento antibacteriano hospitalario de sanitarios múltiples para empleados y público.',
            },
            {
                'code': 'off_hours_shift',
                'name': 'Turno Nocturno / Fin de Semana',
                'brand': 'evolvingsolutions',
                'price': Decimal('50.00'),
                'description': 'Ejecución del trabajo en horario especial fuera de operaciones comerciales para evitar interrupciones.',
            },
        ]

        # Seed Service Rates
        for rate in rates_data:
            obj, created = CleaningServiceRate.objects.update_or_create(
                service_type=rate['service_type'],
                defaults=rate
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Cleaning Rate: {obj.name} [{obj.brand}] (${obj.rate_per_sqft}/sqft, min ${obj.min_order_amount})'))

        # Seed Add-ons
        for addon in addons_data:
            obj, created = CleaningAddon.objects.update_or_create(
                code=addon['code'],
                brand=addon['brand'],
                defaults=addon
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Cleaning Addon: {obj.name} [{obj.brand}] (+${obj.price})'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all GoPropertyCare and Evolving Solutions rates and add-ons!'))
