import type { CleaningServiceRate } from '@/types';

export const DEFAULT_CLEANING_RATES: CleaningServiceRate[] = [
  {
    id: 1,
    name: 'Basic Residential Cleaning',
    service_type: 'residential',
    rate_per_sqft: '0.125',
    min_order_amount: '99.00',
    description: 'Mantenimiento de hogar personalizado (regular o profundo) adaptado a su estilo de vida.',
    is_active: true,
  },
  {
    id: 2,
    name: 'Move-In / Move-Out Cleaning',
    service_type: 'move_in_out',
    rate_per_sqft: '0.200',
    min_order_amount: '99.00',
    description: 'Desinfección profunda y detallada para devoluciones de depósito, mudanzas y presentaciones para venta.',
    is_active: true,
  },
  {
    id: 3,
    name: 'Short Term Rentals (Laundry on site)',
    service_type: 'str_on_site',
    rate_per_sqft: '0.170',
    min_order_amount: '99.00',
    description: 'Preparación express entre huéspedes con lavado de sábanas y toallas en sitio.',
    is_active: true,
  },
  {
    id: 4,
    name: 'Short Term Rentals (Off Site Laundry)',
    service_type: 'str_off_site',
    rate_per_sqft: '0.230',
    min_order_amount: '99.00',
    description: 'Rotación entre huéspedes con retiro y servicio de lavandería externo (off-site).',
    is_active: true,
  },
];

export const DEFAULT_CLEANING_ADDONS = [
  {
    id: 1,
    code: 'oven',
    name: 'Oven Cleaning',
    price: '60.00',
    description: 'Deep oven cleaning and degreasing.',
    is_active: true,
  },
  {
    id: 2,
    code: 'inside_fridge',
    name: 'Inside Fridge Cleaning',
    price: '50.00',
    description: 'Comprehensive sanitization of refrigerator interior and shelves.',
    is_active: true,
  },
  {
    id: 3,
    code: 'blinds',
    name: 'Blinds Cleaning',
    price: '40.00',
    description: 'Detailed dusting and cleaning of window blinds.',
    is_active: true,
  },
  {
    id: 4,
    code: 'inside_windows',
    name: 'Inside Windows Cleaning',
    price: '35.00',
    description: 'Hand washing of interior window panes and sills.',
    is_active: true,
  },
];

