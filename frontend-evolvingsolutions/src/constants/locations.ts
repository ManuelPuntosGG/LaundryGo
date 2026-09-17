import type { DenverLocation } from '@/types';

export const DENVER_LOCATIONS: DenverLocation[] = [
  // Inner Zone: Free Service ($0.00)
  { name: 'Denver (Downtown & Metro)', zone: 'inner', fee: 0 },
  { name: 'Lakewood', zone: 'inner', fee: 0 },
  { name: 'Englewood', zone: 'inner', fee: 0 },
  { name: 'Wheat Ridge', zone: 'inner', fee: 0 },
  { name: 'Arvada', zone: 'inner', fee: 0 },
  { name: 'Westminster', zone: 'inner', fee: 0 },
  { name: 'Boulder', zone: 'inner', fee: 0 },
  { name: 'Broomfield', zone: 'inner', fee: 0 },

  // Outer Zone: $25.00 Travel Fee
  { name: 'Aurora', zone: 'outer', fee: 25 },
  { name: 'Thornton', zone: 'outer', fee: 25 },
  { name: 'Centennial', zone: 'outer', fee: 25 },
  { name: 'Highlands Ranch', zone: 'outer', fee: 25 },
];
