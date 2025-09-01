
import axios from 'axios';
import { toast } from 'sonner';
import { ENDPOINTS, buildUrl } from './endpoints';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add idempotency key for POST, PUT, PATCH requests
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.headers['Idempotency-Key'] = generateIdempotencyKey();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, request } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
          toast.error('Session expired. Please login again.');
          break;
          
        case 403:
          toast.error('Access denied. Insufficient permissions.');
          break;
          
        case 404:
          toast.error('Resource not found.');
          break;
          
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message || err));
          } else {
            toast.error(data.message || 'Validation failed.');
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An unexpected error occurred.');
      }
    } else if (request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Request setup error
      toast.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Helper function to generate idempotency key
const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to handle API responses consistently
export const handleApiResponse = (response) => {
  if (response.data) {
    // Check if response has the expected structure
    if (response.data.success !== undefined) {
      return response.data.success ? response.data : null;
    }
    
    // Handle different response structures
    if (response.data.data) {
      return response.data;
    }
    
    return response.data;
  }
  
  return response;
};

// API helper functions
export const apiRequest = {
  get: async (endpoint, params = {}) => {
    const url = buildUrl(endpoint, params);
    const response = await apiClient.get(url);
    return handleApiResponse(response);
  },
  
  post: async (endpoint, data = {}, params = {}) => {
    const url = buildUrl(endpoint, params);
    const response = await apiClient.post(url, data);
    return handleApiResponse(response);
  },
  
  put: async (endpoint, data = {}, params = {}) => {
    const url = buildUrl(endpoint, params);
    const response = await apiClient.put(url, data);
    return handleApiResponse(response);
  },
  
  patch: async (endpoint, data = {}, params = {}) => {
    const url = buildUrl(endpoint, params);
    const response = await apiClient.patch(url, data);
    return handleApiResponse(response);
  },
  
  delete: async (endpoint, params = {}) => {
    const url = buildUrl(endpoint, params);
    const response = await apiClient.delete(url);
    return handleApiResponse(response);
  }
};

export default apiClient;
