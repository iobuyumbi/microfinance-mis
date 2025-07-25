import api from "./api";
import { handleRequest } from "./handleRequest";

export const savingsService = {
  getAll: (params) =>
    handleRequest(() => api.get("/savings", { params }), "Failed to fetch savings"),

  getById: (id) =>
    handleRequest(() => api.get(`/savings/${id}`), "Failed to fetch saving by ID"),

  create: (data) =>
    handleRequest(() => api.post("/savings", data), "Failed to create saving"),

  update: (id, data) =>
    handleRequest(() => api.put(`/savings/${id}`, data), "Failed to update saving"),

  remove: (id) =>
    handleRequest(() => api.delete(`/savings/${id}`), "Failed to delete saving"),
};
