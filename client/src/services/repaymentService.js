// src/services/repaymentService.js
import api from "./api";
import { handleRequest } from "./handleRequest";

export const repaymentService = {
  getAll: (params) =>
    handleRequest(() => api.get("/repayments", { params }), "Failed to fetch repayments"),

  getById: (id) =>
    handleRequest(() => api.get(`/repayments/${id}`), `Repayment with ID ${id} not found`),

  create: (data) =>
    handleRequest(() => api.post("/repayments", data), "Failed to create repayment"),

  update: (id, data) =>
    handleRequest(() => api.put(`/repayments/${id}`, data), `Failed to update repayment ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/repayments/${id}`), `Failed to delete repayment ${id}`),
};
