import type { CleaningAddon } from '@/types';

export const PROPERTY_ADDONS: CleaningAddon[] = [
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
    description: 'Comprehensive sanitization of interior shelves, compartments, and drawers.',
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
    description: 'Hand washing and streak-free polishing of interior window panes.',
    is_active: true,
  },
];

