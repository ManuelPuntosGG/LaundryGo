import type { CleaningAddon } from '@/types';

export const COMMERCIAL_ADDONS: CleaningAddon[] = [
  {
    id: 101,
    code: 'high_ceilings',
    name: 'Techos Altos y Vigas Industriales',
    price: '45.00',
    description: 'Desempolvado y desinfección de ductos, vigas expuestas y luminarias elevadas de bodega u oficina.',
    is_active: true,
  },
  {
    id: 102,
    code: 'heavy_debris_haul',
    name: 'Retiro y Carga de Escombros Pesados',
    price: '95.00',
    description: 'Acarreo de sacos de tablaroca, maderas, retazos y desechos de demolición hasta contenedor o volqueta.',
    is_active: true,
  },
  {
    id: 103,
    code: 'floor_machine_scrub',
    name: 'Lavado Mecanizado de Pisos Industriales',
    price: '65.00',
    description: 'Pulido y fregado con máquina industrial de pisos de concreto pulido, epóxicos o baldosas comerciales.',
    is_active: true,
  },
  {
    id: 104,
    code: 'window_glass_commercial',
    name: 'Lavado de Cristales y Fachadas Interiores',
    price: '55.00',
    description: 'Limpieza profunda de ventanales comerciales, mamparas de vidrio y vitrinas de piso a techo.',
    is_active: true,
  },
  {
    id: 105,
    code: 'restroom_deep_sanitization',
    name: 'Desinfección Intensiva de Baterías de Baño',
    price: '45.00',
    description: 'Vaporización y tratamiento antibacteriano hospitalario de sanitarios múltiples para empleados y público.',
    is_active: true,
  },
  {
    id: 106,
    code: 'off_hours_shift',
    name: 'Turno Nocturno / Fin de Semana',
    price: '50.00',
    description: 'Ejecución del trabajo en horario especial fuera de operaciones comerciales para evitar interrupciones.',
    is_active: true,
  },
];
