import type { CleaningServiceRate } from '@/types';

export const DEFAULT_COMMERCIAL_RATES: CleaningServiceRate[] = [
  {
    id: 5,
    name: 'Limpieza Comercial / Janitorial',
    service_type: 'commercial',
    rate_per_sqft: '0.18',
    min_order_amount: '99.00',
    description: 'Servicio profesional para oficinas, comercios, bodegas y edificios corporativos. Desinfección integral, sanitarios, áreas comunes y pisos.',
    is_active: true,
  },
  {
    id: 4,
    name: 'Limpieza Post-Construcción',
    service_type: 'post_construction',
    rate_per_sqft: '0.26',
    min_order_amount: '99.00',
    description: 'Limpieza exhaustiva post-obra con aspirado industrial HEPA, remoción de polvo fino de yeso/cemento, calcomanías y pintura en Denver y Boulder.',
    is_active: true,
  },
  {
    id: 6,
    name: 'Demolición de Drywall y Mano de Obra',
    service_type: 'industrial_demolition',
    rate_per_sqft: '0.35',
    min_order_amount: '99.00',
    description: 'Cuadrillas verificadas para demolición selectiva de tablaroca, desmontaje no estructural, limpieza de sitio y retiro de escombros con 100% de cumplimiento en seguros.',
    is_active: true,
  },
];
