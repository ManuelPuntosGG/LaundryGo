from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.cleaning.models import CleaningServiceRate, CleaningPricingTier, CleaningAddon


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

        # Seed GoPropertyCare Pricing Tiers (use get_or_create so admin custom price edits are preserved)
        tiers_data = [
            {'tier_number': 1, 'label': '500 – 999 sq ft', 'min_sqft': 500, 'max_sqft': 999, 'standard_price': Decimal('160.00'), 'deep_price': Decimal('215.00'), 'str_on_site_price': Decimal('185.00'), 'str_off_site_price': Decimal('245.00'), 'is_custom_quote': False},
            {'tier_number': 2, 'label': '1,000 – 1,299 sq ft', 'min_sqft': 1000, 'max_sqft': 1299, 'standard_price': Decimal('210.00'), 'deep_price': Decimal('275.00'), 'str_on_site_price': Decimal('240.00'), 'str_off_site_price': Decimal('315.00'), 'is_custom_quote': False},
            {'tier_number': 3, 'label': '1,300 – 1,599 sq ft', 'min_sqft': 1300, 'max_sqft': 1599, 'standard_price': Decimal('250.00'), 'deep_price': Decimal('325.00'), 'str_on_site_price': Decimal('285.00'), 'str_off_site_price': Decimal('375.00'), 'is_custom_quote': False},
            {'tier_number': 4, 'label': '1,600 – 1,899 sq ft', 'min_sqft': 1600, 'max_sqft': 1899, 'standard_price': Decimal('285.00'), 'deep_price': Decimal('370.00'), 'str_on_site_price': Decimal('325.00'), 'str_off_site_price': Decimal('425.00'), 'is_custom_quote': False},
            {'tier_number': 5, 'label': '1,900 – 2,199 sq ft', 'min_sqft': 1900, 'max_sqft': 2199, 'standard_price': Decimal('320.00'), 'deep_price': Decimal('415.00'), 'str_on_site_price': Decimal('365.00'), 'str_off_site_price': Decimal('475.00'), 'is_custom_quote': False},
            {'tier_number': 6, 'label': '2,200 – 2,499 sq ft', 'min_sqft': 2200, 'max_sqft': 2499, 'standard_price': Decimal('355.00'), 'deep_price': Decimal('460.00'), 'str_on_site_price': Decimal('405.00'), 'str_off_site_price': Decimal('525.00'), 'is_custom_quote': False},
            {'tier_number': 7, 'label': '2,500 – 2,799 sq ft', 'min_sqft': 2500, 'max_sqft': 2799, 'standard_price': Decimal('395.00'), 'deep_price': Decimal('510.00'), 'str_on_site_price': Decimal('450.00'), 'str_off_site_price': Decimal('585.00'), 'is_custom_quote': False},
            {'tier_number': 8, 'label': '2,800 – 3,099 sq ft', 'min_sqft': 2800, 'max_sqft': 3099, 'standard_price': Decimal('435.00'), 'deep_price': Decimal('565.00'), 'str_on_site_price': Decimal('495.00'), 'str_off_site_price': Decimal('645.00'), 'is_custom_quote': False},
            {'tier_number': 9, 'label': '3,100 – 3,399 sq ft', 'min_sqft': 3100, 'max_sqft': 3399, 'standard_price': Decimal('475.00'), 'deep_price': Decimal('615.00'), 'str_on_site_price': Decimal('540.00'), 'str_off_site_price': Decimal('705.00'), 'is_custom_quote': False},
            {'tier_number': 10, 'label': '3,400 – 3,699 sq ft', 'min_sqft': 3400, 'max_sqft': 3699, 'standard_price': Decimal('515.00'), 'deep_price': Decimal('670.00'), 'str_on_site_price': Decimal('585.00'), 'str_off_site_price': Decimal('765.00'), 'is_custom_quote': False},
            {'tier_number': 11, 'label': '3,700 – 3,999 sq ft', 'min_sqft': 3700, 'max_sqft': 3999, 'standard_price': Decimal('555.00'), 'deep_price': Decimal('720.00'), 'str_on_site_price': Decimal('630.00'), 'str_off_site_price': Decimal('825.00'), 'is_custom_quote': False},
            {'tier_number': 12, 'label': '4,000 – 4,299 sq ft', 'min_sqft': 4000, 'max_sqft': 4299, 'standard_price': Decimal('595.00'), 'deep_price': Decimal('775.00'), 'str_on_site_price': Decimal('675.00'), 'str_off_site_price': Decimal('885.00'), 'is_custom_quote': False},
            {'tier_number': 13, 'label': '4,300 – 4,599 sq ft', 'min_sqft': 4300, 'max_sqft': 4599, 'standard_price': Decimal('635.00'), 'deep_price': Decimal('825.00'), 'str_on_site_price': Decimal('720.00'), 'str_off_site_price': Decimal('945.00'), 'is_custom_quote': False},
            {'tier_number': 14, 'label': '4,600 – 4,899 sq ft', 'min_sqft': 4600, 'max_sqft': 4899, 'standard_price': Decimal('675.00'), 'deep_price': Decimal('875.00'), 'str_on_site_price': Decimal('765.00'), 'str_off_site_price': Decimal('1005.00'), 'is_custom_quote': False},
            {'tier_number': 15, 'label': '4,900 – 5,199 sq ft', 'min_sqft': 4900, 'max_sqft': 5199, 'standard_price': Decimal('715.00'), 'deep_price': Decimal('930.00'), 'str_on_site_price': Decimal('810.00'), 'str_off_site_price': Decimal('1065.00'), 'is_custom_quote': False},
            {'tier_number': 16, 'label': '5,200 – 5,499 sq ft', 'min_sqft': 5200, 'max_sqft': 5499, 'standard_price': Decimal('750.00'), 'deep_price': Decimal('975.00'), 'str_on_site_price': Decimal('850.00'), 'str_off_site_price': Decimal('1115.00'), 'is_custom_quote': False},
            {'tier_number': 17, 'label': '5,500 – 5,799 sq ft', 'min_sqft': 5500, 'max_sqft': 5799, 'standard_price': Decimal('785.00'), 'deep_price': Decimal('1020.00'), 'str_on_site_price': Decimal('890.00'), 'str_off_site_price': Decimal('1170.00'), 'is_custom_quote': False},
            {'tier_number': 18, 'label': '5,800 – 6,099 sq ft', 'min_sqft': 5800, 'max_sqft': 6099, 'standard_price': Decimal('820.00'), 'deep_price': Decimal('1065.00'), 'str_on_site_price': Decimal('930.00'), 'str_off_site_price': Decimal('1220.00'), 'is_custom_quote': False},
            {'tier_number': 19, 'label': '6,100+ sq ft', 'min_sqft': 6100, 'max_sqft': 99999, 'standard_price': Decimal('0.00'), 'deep_price': Decimal('0.00'), 'str_on_site_price': Decimal('0.00'), 'str_off_site_price': Decimal('0.00'), 'is_custom_quote': True},
        ]

        for tier in tiers_data:
            t_num = tier['tier_number']
            brand = 'gopropertycare'
            tier_copy = dict(tier)
            obj, created = CleaningPricingTier.objects.get_or_create(
                brand=brand,
                tier_number=t_num,
                defaults={
                    'brand': brand,
                    **tier_copy,
                }
            )
            status = 'Created' if created else 'Existing'
            self.stdout.write(self.style.SUCCESS(f'{status} Pricing Tier {obj.tier_number}: {obj.label} (Std: ${obj.standard_price}, Deep: ${obj.deep_price})'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all GoPropertyCare and Evolving Solutions rates, add-ons and pricing tiers!'))
