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
  {
    id: 5,
    code: 'off_site_laundry',
    name: 'Off-Site Laundry Service',
    price: '45.00',
    description: 'Off-site transport, professional wash & fold, and replacement for properties without in-unit washer/dryer.',
    is_active: true,
  },
  {
    id: 6,
    code: 'pets',
    name: 'Pets (Hair & Odors)',
    price: '20.00',
    description: 'Deep vacuuming, lint roll, and pet odor neutralizing treatment.',
    is_active: true,
  },
  {
    id: 6,
    code: 'hot_tub',
    name: 'Hot Tub / Jacuzzi Surface Clean',
    price: '25.00',
    description: 'Surface wipe-down, sanitization and cover cleaning without chemicals.',
    is_active: true,
  },
  {
    id: 7,
    code: 'patio_grill',
    name: 'Patio, Balcony or Grill Clean',
    price: '20.00',
    description: 'Outdoor furniture wiped, swept, and grill grates cleaned.',
    is_active: true,
  },
];

