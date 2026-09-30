import axios from 'axios';

export const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mana_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for clear errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto handle expired session if not currently on login page
      if (!window.location.pathname.includes('/login')) {
        // localStorage.removeItem('mana_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
