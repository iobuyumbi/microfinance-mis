// src/services/notificationService.js
import api from "./api";
import { handleRequest } from "./handleRequest";

export const notificationService = {
  getAll: (params) =>
    handleRequest(() => api.get("/notifications", { params }), "Failed to fetch notifications"),

  getById: (id) =>
    handleRequest(() => api.get(`/notifications/${id}`), `Notification with ID ${id} not found`),

  create: (data) =>
    handleRequest(() => api.post("/notifications", data), "Failed to create notification"),

  update: (id, data) =>
    handleRequest(() => api.put(`/notifications/${id}`, data), `Failed to update notification ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/notifications/${id}`), `Failed to delete notification ${id}`),
};
