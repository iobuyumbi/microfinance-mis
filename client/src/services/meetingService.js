// src/services/meetingService.js
import api from "./api";
import { handleRequest } from "./handleRequest";

export const meetingService = {
  getAll: (params) =>
    handleRequest(() => api.get("/meetings", { params }), "Failed to fetch meetings"),

  getById: (id) =>
    handleRequest(() => api.get(`/meetings/${id}`), `Meeting with ID ${id} not found`),

  create: (data) =>
    handleRequest(() => api.post("/meetings", data), "Failed to create meeting"),

  update: (id, data) =>
    handleRequest(() => api.put(`/meetings/${id}`, data), `Failed to update meeting ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/meetings/${id}`), `Failed to delete meeting ${id}`),
};
