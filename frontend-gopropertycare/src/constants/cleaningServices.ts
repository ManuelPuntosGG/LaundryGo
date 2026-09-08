import type { CleaningServiceRate } from '@/types';

export const DEFAULT_CLEANING_RATES: CleaningServiceRate[] = [
  {
    id: 1,
    name: 'Limpieza Regular',
    service_type: 'regular',
    rate_per_sqft: '0.1000',
    min_order_amount: '99.00',
    description: 'Cuidado y limpieza estándar para residencias y comercios. Mantenimiento preventivo de superficies, baños, cocina y pisos.',
    is_active: true,
  },
  {
    id: 2,
    name: 'Limpieza Profunda (GoFurther)',
    service_type: 'deep',
    rate_per_sqft: '0.1600',
    min_order_amount: '99.00',
    description: 'Limpieza exhaustiva con desincrustación profunda, zócalos, juntas y suciedad pesada acumulada.',
    is_active: true,
  },
  {
    id: 3,
    name: 'Limpieza MoveIn/MoveOut',
    service_type: 'move_in_out',
    rate_per_sqft: '0.2000',
    min_order_amount: '99.00',
    description: 'Limpieza completa y detallada para entrega o recibimiento de propiedades impecables para mudanza.',
    is_active: true,
  },
  {
    id: 4,
    name: 'Limpieza Post-Construcción',
    service_type: 'post_construction',
    rate_per_sqft: '0.2600',
    min_order_amount: '99.00',
    description: 'Limpieza de máximo nivel con aspirado de grado industrial, remoción de polvo fino de obra y restos de pintura tras remodelaciones.',
    is_active: true,
  },
];
