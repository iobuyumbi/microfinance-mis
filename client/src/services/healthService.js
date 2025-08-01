// src/services/healthService.js
import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const healthService = {
  checkHealth: async () => {
    try {
      const response = await api.get(ENDPOINTS.HEALTH.BASE);
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

  checkPublicAccess: async () => {
    try {
      const response = await api.get(ENDPOINTS.AUTH.STATUS);
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

      const response = await api.get(ENDPOINTS.AUTH.ME);
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
