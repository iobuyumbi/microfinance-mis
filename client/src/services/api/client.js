import axios from "axios";
import { toast } from "sonner";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response time
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    const duration = startTime ? endTime - startTime : 0;

    if (import.meta.env.DEV) {
      console.log(
        `API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`
      );
    }

    return response;
  },
  (error) => {
    const { response, config } = error;

    // Log error details
    if (import.meta.env.DEV) {
      console.error("API Error:", {
        url: config?.url,
        method: config?.method,
        status: response?.status,
        data: response?.data,
        message: error.message,
      });
    }

    // Handle different error scenarios
    if (!response) {
      // Network error
      toast.error("Network error - please check your internet connection");
      return Promise.reject(
        new Error("Network error - please check your internet connection")
      );
    }

    switch (response.status) {
      case 401:
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        toast.error("Session expired. Please login again.");
        break;

      case 403:
        // Forbidden
        toast.error(
          "Access denied. You do not have permission to perform this action."
        );
        break;

      case 404:
        // Not found
        toast.error("Resource not found.");
        break;

      case 422:
        // Validation error
        const validationErrors =
          response.data?.errors || response.data?.message;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err) => toast.error(err));
        } else {
          toast.error(validationErrors || "Validation error");
        }
        break;

      case 429:
        // Rate limited
        toast.error("Too many requests. Please try again later.");
        break;

      case 500:
        // Server error
        toast.error("Server error. Please try again later.");
        break;

      default:
        // Other errors
        const message =
          response.data?.message || "An unexpected error occurred";
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API methods with better error handling
export const api = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, file, onProgress = null) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: onProgress,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiClient;
