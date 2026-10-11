import type { DenverLocation } from '@/types';

export const SERVICE_AREAS: string[] = [
  'Denver',
  'Englewood',
  'Wheat Ridge',
  'Arvada',
  'Westminster',
  'Thornton',
  'Broomfield',
  'Boulder',
  'Aurora',
  'Centennial',
  'Castle Rock',
  'Highlands Ranch',
];

export const DENVER_LOCATIONS: DenverLocation[] = SERVICE_AREAS.map((city) => ({
  name: city,
  zone: 'inner',
  fee: 0,
}));
