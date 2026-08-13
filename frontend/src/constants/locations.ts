export interface DenverLocation {
  name: string;
  zone: 'inner' | 'outer';
  fee: number;
}

export const DENVER_LOCATIONS: DenverLocation[] = [
  { name: 'Denver (Downtown / Central)', zone: 'inner', fee: 0 },
  { name: 'Lakewood', zone: 'inner', fee: 0 },
  { name: 'Englewood', zone: 'inner', fee: 0 },
  { name: 'Wheat Ridge', zone: 'inner', fee: 0 },
  { name: 'Arvada', zone: 'inner', fee: 0 },
  { name: 'Aurora', zone: 'outer', fee: 25 },
  { name: 'Thornton', zone: 'outer', fee: 25 },
  { name: 'Westminster', zone: 'outer', fee: 25 },
  { name: 'Centennial', zone: 'outer', fee: 25 },
  { name: 'Highlands Ranch', zone: 'outer', fee: 25 },
  { name: 'Broomfield', zone: 'outer', fee: 25 },
];
