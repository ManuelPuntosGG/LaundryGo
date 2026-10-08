from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.cleaning.models import CleaningServiceRate, CleaningAddon


class Command(BaseCommand):
    help = 'Seeds initial GoPropertyCare and Evolving Solutions cleaning rates and add-ons'

    def handle(self, *args, **kwargs):
        rates_data = [
            # GoPropertyCare - Tarifas provistas por el cliente
            {
                'name': 'Basic Residential Cleaning',
                'service_type': 'residential',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.125'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Mantenimiento de hogar personalizado (regular o profundo) adaptado a su estilo de vida.',
            },
            {
                'name': 'Move-In / Move-Out Cleaning',
                'service_type': 'move_in_out',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.200'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Desinfección profunda y detallada para devoluciones de depósito, mudanzas y propiedades en venta.',
            },
            {
                'name': 'Short Term Rentals (Laundry on site)',
                'service_type': 'str_on_site',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.170'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Preparación y rotación express entre huéspedes con lavado de sábanas y toallas en sitio.',
            },
            {
                'name': 'Short Term Rentals (Off Site Laundry)',
                'service_type': 'str_off_site',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.230'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Rotación integral entre huéspedes con retiro, lavado externo (off-site) y reposición de blancos.',
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
            # GoPropertyCare Add-ons (Only 4 priced add-ons as specified by client)
            {
                'code': 'oven',
                'name': 'Oven Cleaning',
                'brand': 'gopropertycare',
                'price': Decimal('60.00'),
                'description': 'Limpieza profunda y desengrasado interior de horno.',
            },
            {
                'code': 'inside_fridge',
                'name': 'Inside Fridge Cleaning',
                'brand': 'gopropertycare',
                'price': Decimal('50.00'),
                'description': 'Desinfección integral y limpieza de compartimentos interiores de refrigerador.',
            },
            {
                'code': 'blinds',
                'name': 'Blinds Cleaning',
                'brand': 'gopropertycare',
                'price': Decimal('40.00'),
                'description': 'Desempolvado y limpieza detallada de persianas.',
            },
            {
                'code': 'inside_windows',
                'name': 'Inside Windows Cleaning',
                'brand': 'gopropertycare',
                'price': Decimal('35.00'),
                'description': 'Lavado minucioso de vidrios y ventanales interiores.',
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

        # Clean obsolete GoPropertyCare rates and add-ons
        active_gpc_rates = [r['service_type'] for r in rates_data if r['brand'] == 'gopropertycare']
        CleaningServiceRate.objects.filter(brand='gopropertycare').exclude(service_type__in=active_gpc_rates).delete()

        active_gpc_addons = [a['code'] for a in addons_data if a['brand'] == 'gopropertycare']
        CleaningAddon.objects.filter(brand='gopropertycare').exclude(code__in=active_gpc_addons).delete()

        # Seed Service Rates
        for rate in rates_data:
            obj, created = CleaningServiceRate.objects.update_or_create(
                service_type=rate['service_type'],
                brand=rate['brand'],
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
