import type { CleaningServiceRate } from '@/types';

export const DEFAULT_CLEANING_RATES: CleaningServiceRate[] = [
  {
    id: 1,
    name: 'Limpieza Regular',
    service_type: 'regular',
    rate_per_sqft: '0.1000',
    min_order_amount: '99.00',
    description: 'Tu hogar siempre fresco, ordenado y reluciente. La solución perfecta para mantener tus espacios impecables semana a semana.',
    is_active: true,
  },
  {
    id: 2,
    name: 'Limpieza Profunda (GoFurther)',
    service_type: 'deep',
    rate_per_sqft: '0.1600',
    min_order_amount: '99.00',
    description: 'Para cuando tu hogar necesita un cariño extra. Llegamos a la suciedad oculta, zócalos y rincones que la rutina deja atrás.',
    is_active: true,
  },
  {
    id: 3,
    name: 'Limpieza MoveIn/MoveOut',
    service_type: 'move_in_out',
    rate_per_sqft: '0.2000',
    min_order_amount: '99.00',
    description: 'Múdate con total tranquilidad. Dejamos tu nuevo hogar listo para habitar o tu vivienda anterior lista para entrega y recuperación de depósito.',
    is_active: true,
  },
  {
    id: 4,
    name: 'Limpieza Post-Construcción',
    service_type: 'post_construction',
    rate_per_sqft: '0.2600',
    min_order_amount: '99.00',
    description: 'Transforma tu remodelación en un espacio habitable, limpio y seguro. Retiramos el polvo fino de obra para que estrenes sin estrés.',
    is_active: true,
  },
];

