// src/services/authService.js
import api from "./api";
import { handleRequest } from "./handleRequest";

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

  resetPassword: (token, data) =>
    handleRequest(
      () => api.post(`/auth/reset-password/${token}`, data),
      "Failed to reset password"
    ),
};
