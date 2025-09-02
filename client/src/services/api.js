import axios from "axios";
import { toast } from "sonner";

// Create axios instance for microfinance API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle different error scenarios
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
          toast.error("Session expired. Please log in again.");
          break;

        case 403:
          // Forbidden
          toast.error("You don't have permission to perform this action.");
          break;

        case 404:
          // Not found
          toast.error("Resource not found.");
          break;

        case 422:
          // Validation error
          const validationErrors = data.errors || data.message;
          if (Array.isArray(validationErrors)) {
            validationErrors.forEach((error) => toast.error(error));
          } else {
            toast.error(validationErrors || "Validation failed.");
          }
          break;

        case 500:
          // Server error
          toast.error("Server error. Please try again later.");
          break;

        default:
          // Other errors
          toast.error(data.message || "An error occurred.");
      }
    } else {
      // Network error
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api; 