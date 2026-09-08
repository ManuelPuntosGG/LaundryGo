import type { CleaningAddon } from '@/types';

export const PROPERTY_ADDONS: CleaningAddon[] = [
  {
    id: 1,
    code: 'pets_presence',
    name: 'Hogar con Mascotas',
    price: '35.00',
    description: 'Cuidado especial para retirar pelos rebeldes y refrescar tapicerías y pisos.',
    is_active: true,
  },
  {
    id: 2,
    code: 'high_ceilings',
    name: 'Techos Altos o Ventanales',
    price: '30.00',
    description: 'Limpieza segura de lámparas elevadas, molduras y ventanales fuera de alcance.',
    is_active: true,
  },
  {
    id: 3,
    code: 'oven_fridge_interior',
    name: 'Interior de Horno y Refrigerador',
    price: '45.00',
    description: 'Limpieza a fondo por dentro de tus electrodomésticos, frescos y listos para tus alimentos.',
    is_active: true,
  },
  {
    id: 4,
    code: 'cabinets_interior',
    name: 'Interior de Alacenas y Gabinetes',
    price: '35.00',
    description: 'Limpieza y desinfección interna de cajones y estantes de cocina o baños.',
    is_active: true,
  },
  {
    id: 5,
    code: 'basement_attic',
    name: 'Sótano Amueblado o Ático',
    price: '50.00',
    description: 'Limpieza integral de tu área adicional de sótano terminado o ático habitable.',
    is_active: true,
  },
  {
    id: 6,
    code: 'patio_balcony',
    name: 'Balcón o Terraza Exterior',
    price: '25.00',
    description: 'Barrido y lavado de tu espacio exterior para que disfrutes del aire fresco.',
    is_active: true,
  },
];

