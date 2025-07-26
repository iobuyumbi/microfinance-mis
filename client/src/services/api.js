
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error);

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error – please check your internet connection.'));
    }

    const message = error.response.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Export the configured axios instance
export default api;

// Export common API methods for convenience
export const apiMethods = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('API Connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('API Connection failed:', error.message);
    return false;
  }
};