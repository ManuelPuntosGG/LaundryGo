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
                'name': 'Deep Residential Cleaning',
                'service_type': 'deep',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.200'),
                'min_order_amount': Decimal('99.00'),
                'description': 'Desinfección profunda y detallada de rodapiés, desinfección a fondo y preparación del hogar.',
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
            {
                'name': 'Commercial Cleaning Walkthrough',
                'service_type': 'commercial',
                'brand': 'gopropertycare',
                'rate_per_sqft': Decimal('0.000'),
                'min_order_amount': Decimal('0.00'),
                'description': '15-minute on-site walkthrough for commercial spaces with a same-day custom quote.',
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
            {
                'code': 'off_site_laundry',
                'name': 'Off-Site Laundry Service',
                'brand': 'gopropertycare',
                'price': Decimal('45.00'),
                'description': 'Servicio de retiro, lavado profesional externo y retorno de blancos para propiedades sin lavandería en sitio.',
            },
            {
                'code': 'pets',
                'name': 'Mascotas (Pelo y Olores)',
                'brand': 'gopropertycare',
                'price': Decimal('20.00'),
                'description': 'Aspirado especializado y tratamiento desodorizante por estancia con mascotas.',
            },
            {
                'code': 'hot_tub',
                'name': 'Jacuzzi / Tina de Hidromasaje',
                'brand': 'gopropertycare',
                'price': Decimal('25.00'),
                'description': 'Limpieza de superficies y tapa del jacuzzi sin balanceo de químicos.',
            },
            {
                'code': 'patio_grill',
                'name': 'Patio, Balcón o Parrilla',
                'brand': 'gopropertycare',
                'price': Decimal('20.00'),
                'description': 'Limpieza de mobiliario exterior, barrido y raspado de parrilla.',
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

        # Seed GoPropertyCare Pricing Tiers (18 tiers: Tier 0 to Tier 16 + Custom Quote)
        tiers_data = [
            {'tier_number': 0, 'label': '500 – 999 sq ft', 'min_sqft': 500, 'max_sqft': 999, 'standard_price': Decimal('155.00'), 'deep_price': Decimal('235.00'), 'str_on_site_price': Decimal('205.00'), 'str_off_site_price': Decimal('270.00'), 'is_custom_quote': False},
            {'tier_number': 1, 'label': '1,000 – 1,299 sq ft', 'min_sqft': 1000, 'max_sqft': 1299, 'standard_price': Decimal('175.00'), 'deep_price': Decimal('270.00'), 'str_on_site_price': Decimal('230.00'), 'str_off_site_price': Decimal('310.00'), 'is_custom_quote': False},
            {'tier_number': 2, 'label': '1,300 – 1,599 sq ft', 'min_sqft': 1300, 'max_sqft': 1599, 'standard_price': Decimal('190.00'), 'deep_price': Decimal('295.00'), 'str_on_site_price': Decimal('255.00'), 'str_off_site_price': Decimal('340.00'), 'is_custom_quote': False},
            {'tier_number': 3, 'label': '1,600 – 1,899 sq ft', 'min_sqft': 1600, 'max_sqft': 1899, 'standard_price': Decimal('200.00'), 'deep_price': Decimal('320.00'), 'str_on_site_price': Decimal('270.00'), 'str_off_site_price': Decimal('370.00'), 'is_custom_quote': False},
            {'tier_number': 4, 'label': '1,900 – 2,199 sq ft', 'min_sqft': 1900, 'max_sqft': 2199, 'standard_price': Decimal('215.00'), 'deep_price': Decimal('360.00'), 'str_on_site_price': Decimal('300.00'), 'str_off_site_price': Decimal('420.00'), 'is_custom_quote': False},
            {'tier_number': 5, 'label': '2,200 – 2,499 sq ft', 'min_sqft': 2200, 'max_sqft': 2499, 'standard_price': Decimal('230.00'), 'deep_price': Decimal('410.00'), 'str_on_site_price': Decimal('340.00'), 'str_off_site_price': Decimal('480.00'), 'is_custom_quote': False},
            {'tier_number': 6, 'label': '2,500 – 2,799 sq ft', 'min_sqft': 2500, 'max_sqft': 2799, 'standard_price': Decimal('250.00'), 'deep_price': Decimal('460.00'), 'str_on_site_price': Decimal('375.00'), 'str_off_site_price': Decimal('545.00'), 'is_custom_quote': False},
            {'tier_number': 7, 'label': '2,800 – 3,099 sq ft', 'min_sqft': 2800, 'max_sqft': 3099, 'standard_price': Decimal('270.00'), 'deep_price': Decimal('505.00'), 'str_on_site_price': Decimal('410.00'), 'str_off_site_price': Decimal('600.00'), 'is_custom_quote': False},
            {'tier_number': 8, 'label': '3,100 – 3,399 sq ft', 'min_sqft': 3100, 'max_sqft': 3399, 'standard_price': Decimal('295.00'), 'deep_price': Decimal('550.00'), 'str_on_site_price': Decimal('450.00'), 'str_off_site_price': Decimal('650.00'), 'is_custom_quote': False},
            {'tier_number': 9, 'label': '3,400 – 3,699 sq ft', 'min_sqft': 3400, 'max_sqft': 3699, 'standard_price': Decimal('315.00'), 'deep_price': Decimal('590.00'), 'str_on_site_price': Decimal('480.00'), 'str_off_site_price': Decimal('700.00'), 'is_custom_quote': False},
            {'tier_number': 10, 'label': '3,700 – 3,999 sq ft', 'min_sqft': 3700, 'max_sqft': 3999, 'standard_price': Decimal('335.00'), 'deep_price': Decimal('640.00'), 'str_on_site_price': Decimal('520.00'), 'str_off_site_price': Decimal('760.00'), 'is_custom_quote': False},
            {'tier_number': 11, 'label': '4,000 – 4,299 sq ft', 'min_sqft': 4000, 'max_sqft': 4299, 'standard_price': Decimal('355.00'), 'deep_price': Decimal('695.00'), 'str_on_site_price': Decimal('560.00'), 'str_off_site_price': Decimal('830.00'), 'is_custom_quote': False},
            {'tier_number': 12, 'label': '4,300 – 4,599 sq ft', 'min_sqft': 4300, 'max_sqft': 4599, 'standard_price': Decimal('385.00'), 'deep_price': Decimal('740.00'), 'str_on_site_price': Decimal('600.00'), 'str_off_site_price': Decimal('880.00'), 'is_custom_quote': False},
            {'tier_number': 13, 'label': '4,600 – 4,899 sq ft', 'min_sqft': 4600, 'max_sqft': 4899, 'standard_price': Decimal('410.00'), 'deep_price': Decimal('785.00'), 'str_on_site_price': Decimal('635.00'), 'str_off_site_price': Decimal('935.00'), 'is_custom_quote': False},
            {'tier_number': 14, 'label': '4,900 – 5,299 sq ft', 'min_sqft': 4900, 'max_sqft': 5299, 'standard_price': Decimal('435.00'), 'deep_price': Decimal('820.00'), 'str_on_site_price': Decimal('665.00'), 'str_off_site_price': Decimal('975.00'), 'is_custom_quote': False},
            {'tier_number': 15, 'label': '5,300 – 5,699 sq ft', 'min_sqft': 5300, 'max_sqft': 5699, 'standard_price': Decimal('455.00'), 'deep_price': Decimal('850.00'), 'str_on_site_price': Decimal('690.00'), 'str_off_site_price': Decimal('1010.00'), 'is_custom_quote': False},
            {'tier_number': 16, 'label': '5,700 – 6,099 sq ft', 'min_sqft': 5700, 'max_sqft': 6099, 'standard_price': Decimal('480.00'), 'deep_price': Decimal('890.00'), 'str_on_site_price': Decimal('725.00'), 'str_off_site_price': Decimal('1055.00'), 'is_custom_quote': False},
            {'tier_number': 17, 'label': '6,100+ sq ft', 'min_sqft': 6100, 'max_sqft': 99999, 'standard_price': Decimal('0.00'), 'deep_price': Decimal('0.00'), 'str_on_site_price': Decimal('0.00'), 'str_off_site_price': Decimal('0.00'), 'is_custom_quote': True},
        ]

        active_tier_numbers = [t['tier_number'] for t in tiers_data]
        CleaningPricingTier.objects.filter(brand='gopropertycare').exclude(tier_number__in=active_tier_numbers).delete()

        for tier in tiers_data:
            t_num = tier['tier_number']
            brand = 'gopropertycare'
            tier_copy = dict(tier)
            obj, created = CleaningPricingTier.objects.update_or_create(
                brand=brand,
                tier_number=t_num,
                defaults={
                    'brand': brand,
                    **tier_copy,
                }
            )
            status = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f'{status} Pricing Tier {obj.tier_number}: {obj.label} (Std: ${obj.standard_price}, Deep: ${obj.deep_price})'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded all GoPropertyCare and Evolving Solutions rates, add-ons and pricing tiers!'))
