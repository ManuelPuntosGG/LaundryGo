import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
// Safely normalize VITE_API_URL across local and production (Render) environments
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || typeof envUrl !== 'string' || !envUrl.trim()) {
    // In local development, use relative '/api/v1' which is proxied by Vite
    return '/api/v1';
  }

  let clean = envUrl.trim();

  // If Render internal service name was passed without domain (e.g. 'laundrygo-api')
  if (clean === 'laundrygo-api' || (!clean.includes('.') && !clean.startsWith('/') && !clean.startsWith('http'))) {
    clean = 'https://laundrygo-api.onrender.com';
  }

  // If host is provided without protocol (e.g. 'laundrygo-api.onrender.com')
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('/')) {
    clean = `https://${clean}`;
  }

  // Remove trailing slashes
  clean = clean.replace(/\/+$/, '');

  // Ensure /api/v1 suffix is present without duplication
  if (clean.endsWith('/api/v1')) {
    return clean;
  }
  if (clean.endsWith('/api')) {
    return `${clean}/v1`;
  }
  return `${clean}/api/v1`;
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error(`[API Network Error] Failed to reach: ${error.config?.baseURL || ''}${error.config?.url || ''}`);
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
