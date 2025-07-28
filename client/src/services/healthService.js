// src/services/healthService.js
import api from "./api";

export const healthService = {
  // Check if the backend server is running
  checkHealth: async () => {
    try {
      const response = await api.get("/health");
      return {
        status: "healthy",
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Check if the API is accessible without authentication
  checkPublicAccess: async () => {
    try {
      const response = await api.get("/auth/status");
      return {
        status: "accessible",
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "inaccessible",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Test authentication endpoint
  testAuth: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          status: "no-token",
          message: "No authentication token found",
          timestamp: new Date().toISOString(),
        };
      }

      const response = await api.get("/auth/me");
      return {
        status: "authenticated",
        data: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "auth-failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
};
