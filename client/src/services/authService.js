import api from "../lib/axios";

export const authService = {
  login: (data) => api.post("/auth/login", data).then((res) => res.data),
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
  getMe: () => api.get("/auth/me").then((res) => res.data),
  forgotPassword: (data) =>
    api.post("/auth/forgot-password", data).then((res) => res.data),
  resetPassword: (token, data) =>
    api.post(`/auth/reset-password/${token}`, data).then((res) => res.data),
};
