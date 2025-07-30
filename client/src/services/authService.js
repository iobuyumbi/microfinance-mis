// client/src/services/authService.js (REVISED)
import api from "./api";
import { handleRequest } from "./handleRequest"; // Assuming this is a utility for error handling/data extraction

export const authService = {
  register: (data) =>
    handleRequest(() => api.post("/auth/register", data), "Failed to register"),

  login: (credentials) =>
    handleRequest(
      () => api.post("/auth/login", credentials),
      "Failed to login"
    ),

  logout: () =>
    handleRequest(() => api.post("/auth/logout"), "Failed to logout"),

  getMe: () =>
    handleRequest(
      () => api.get("/auth/me"),
      "Failed to fetch authenticated user"
    ),

  forgotPassword: (data) =>
    handleRequest(
      () => api.post("/auth/forgot-password", data),
      "Failed to send reset email"
    ),

  // --- CRITICAL CORRECTION HERE ---
  resetPassword: (
    token,
    newPassword // Renamed 'data' to 'newPassword' for clarity
  ) =>
    handleRequest(
      () =>
        api.post(
          "/auth/reset-password", // Changed URL to remove path parameter
          { token, password: newPassword } // Send token and password in the request body
        ),
      "Failed to reset password"
    ),
  // --------------------------------
};
