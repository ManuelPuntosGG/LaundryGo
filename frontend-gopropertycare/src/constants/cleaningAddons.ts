import type { CleaningAddon } from '@/types';

export const PROPERTY_ADDONS: CleaningAddon[] = [
  {
    id: 1,
    code: 'pets_presence',
    name: 'Presencia de Mascotas',
    price: '35.00',
    description: 'Tratamiento especial de pelos, caspa y eliminación de olores en tapicería y pisos.',
    is_active: true,
  },
  {
    id: 2,
    code: 'high_ceilings',
    name: 'Techos Altos / Ventanales',
    price: '30.00',
    description: 'Limpieza de cornisas, lámparas elevadas y ventanales con equipo telescópico.',
    is_active: true,
  },
  {
    id: 3,
    code: 'oven_fridge_interior',
    name: 'Interior de Horno y Refrigerador',
    price: '45.00',
    description: 'Desengrasado térmico profundo y desinfección total de interiores de electrodomésticos.',
    is_active: true,
  },
  {
    id: 4,
    code: 'cabinets_interior',
    name: 'Interior de Alacenas y Gabinetes',
    price: '35.00',
    description: 'Desocupar, aspirar residuos y desinfectar cajones y estantes de cocina y baños.',
    is_active: true,
  },
  {
    id: 5,
    code: 'basement_attic',
    name: 'Sótano Terminado / Ático',
    price: '50.00',
    description: 'Inclusión de área adicional terminada en el plan de limpieza.',
    is_active: true,
  },
  {
    id: 6,
    code: 'patio_balcony',
    name: 'Balcón o Patio Exterior',
    price: '25.00',
    description: 'Barrido, lavado y remoción de polvo y hojas en área exterior inmediata.',
    is_active: true,
  },
];
