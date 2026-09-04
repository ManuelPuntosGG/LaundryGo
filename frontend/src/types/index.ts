export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  street_address?: string;
  city?: string;
  zip_code?: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface ServiceRate {
  id: number;
  name: string;
  service_type: 'standard' | 'go' | 'gofurther';
  rate_per_lb: string;
  delivery_days: number;
  description: string;
  is_active?: boolean;
}

export interface Order {
  id: number;
  user: number | null;
  guest_email: string;
  guest_first_name: string;
  guest_last_name: string;
  guest_phone: string;
  street_address?: string;
  city?: string;
  zip_code?: string;
  delivery_zone?: string;
  delivery_fee?: number;
  service_rate: number;
  service_name: string;
  service_type: string;
  rate_per_lb: string;
  pickup_date: string;
  pickup_time_slot: 'morning' | 'afternoon';
  order_details: string;
  pickup_instructions: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  language?: 'en' | 'es';
  customer_name: string;
  customer_email: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringSchedule {
  id: number;
  user: number;
  order: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'fortnightly' | 'monthly';
  is_active: boolean;
  next_pickup_date: string;
  order_detail: Order;
}

export interface AvailableDate {
  date: string;
  goavailable?: boolean;
  gofurther_available: boolean;
  day_name?: string;
  formatted_date?: string;
}
