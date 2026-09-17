export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  street_address: string;
  city: string;
  zip_code: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export type CleaningServiceType = 'regular' | 'deep' | 'move_in_out';

export interface CleaningServiceRate {
  id: number;
  name: string;
  service_type: CleaningServiceType;
  rate_per_sqft: string | number;
  min_order_amount: string | number;
  description: string;
  is_active: boolean;
}

export interface CleaningAddon {
  id?: number;
  name: string;
  code: string;
  price: string | number;
  description: string;
  is_active?: boolean;
}

export interface CleaningOrder {
  id: number;
  brand?: 'gopropertycare' | 'evolvingsolutions';
  user: number | null;
  guest_email: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_phone: string;
  street_address: string;
  city: string;
  zip_code: string;
  delivery_zone: 'inner' | 'outer';
  delivery_fee: string | number;
  service_rate: CleaningServiceRate;
  square_feet: number;
  selected_addons: CleaningAddon[];
  service_date: string;
  time_slot: 'morning' | 'afternoon';
  special_instructions: string;
  base_price: string | number;
  addons_total: string | number;
  total_price: string | number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  language: string;
  created_at: string;
  updated_at?: string;
}

export interface CleaningAvailableDate {
  date: string;
  available: boolean;
}

export interface DenverLocation {
  name: string;
  zone: 'inner' | 'outer';
  fee: number;
}
