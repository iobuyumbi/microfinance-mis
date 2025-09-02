
import axios from 'axios';
import { toast } from 'sonner';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    // Ensure consistent response structure
    if (response.data && typeof response.data === 'object') {
      // Debug logging for development
      if (import.meta.env.DEV) {
        console.log('Response interceptor - Original response.data:', response.data);
      }
      
      // If the response has a nested data structure, flatten it
      if (response.data.success !== undefined && response.data.data !== undefined) {
        const processedResponse = {
          ...response,
          data: response.data.data,
          success: response.data.success,
          message: response.data.message,
          originalResponse: response.data
        };
        if (import.meta.env.DEV) {
          console.log('Response interceptor - Nested structure processed:', processedResponse);
        }
        return processedResponse;
      }
      
      // If the response has a flat structure with success, token, user, etc.
      if (response.data.success !== undefined) {
        const processedResponse = {
          ...response,
          success: response.data.success,
          message: response.data.message,
          token: response.data.token,
          user: response.data.user,
          originalResponse: response.data
        };
        if (import.meta.env.DEV) {
          console.log('Response interceptor - Flat structure processed:', processedResponse);
        }
        return processedResponse;
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const networkError = {
        message: 'Network error: Unable to connect to server',
        type: 'network',
        status: 0
      };
      
      toast.error('Connection failed. Please check your internet connection.');
      return Promise.reject(networkError);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login unless already on auth page
      if (!window.location.pathname.includes('/auth/')) {
        toast.error('Session expired. Please login again.');
        window.location.href = '/auth/login';
      }
      
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Handle client errors (400-499)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Request failed';
      
      // Don't show toast for validation errors (they should be handled by forms)
      if (error.response?.status !== 422) {
        toast.error(errorMessage);
      }
    }

    // Retry logic for temporary failures
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await apiClient(originalRequest);
      } catch (retryError) {
        // If retry fails, continue with original error
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API responses consistently
export const handleApiResponse = (response) => {
  if (response.success !== undefined) {
    return response.success ? response : Promise.reject(response);
  }
  
  // For responses that don't have success field, assume success if we got data
  return response;
};

// Helper function for API calls with loading states
export const apiCall = async (apiFunction, options = {}) => {
  const { 
    onSuccess, 
    onError, 
    showSuccessToast = false, 
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  try {
    const response = await apiFunction();
    
    if (showSuccessToast) {
      toast.success(successMessage);
    }
    
    if (onSuccess) {
      onSuccess(response);
    }
    
    return response;
  } catch (error) {
    if (showErrorToast && error.response?.status !== 422) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'An unexpected error occurred';
      toast.error(errorMessage);
    }
    
    if (onError) {
      onError(error);
    }
    
    throw error;
  }
};

export default apiClient;

// Named exports for backward compatibility
export const api = apiClient;
export const apiRequest = apiClient;
export { apiClient };
