import { createContext, useContext } from 'react';
import type { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    street_address?: string;
    city?: string;
    zip_code?: string;
    password: string;
    password_confirm: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
