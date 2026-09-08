import { useState, useEffect, useCallback } from 'react';
import api from '@/api';
import type { User, AuthResponse } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get<User>('/auth/me/');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login/', { email, password });
    const { user: userData, access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const register = async (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    street_address?: string;
    city?: string;
    zip_code?: string;
    password: string;
    password_confirm: string;
  }) => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    const { user: userData, access, refresh } = response.data;

    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/token/blacklist/', { refresh: refreshToken }).catch(() => {});
      }
    } catch {
      // Ignore potential errors during logout token blacklist
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  };
};
