import api from "./api";
import { handleRequest } from "./handleRequest";

export const loanService = {
  getAll: (params) =>
    handleRequest(() => api.get("/loans", { params }), "Failed to fetch loans"),

  getById: (id) =>
    handleRequest(() => api.get(`/loans/${id}`), `Loan with ID ${id} not found`),

  create: (data) =>
    handleRequest(() => api.post("/loans", data), "Failed to create loan"),

  update: (id, data) =>
    handleRequest(() => api.put(`/loans/${id}`, data), `Failed to update loan ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/loans/${id}`), `Failed to delete loan ${id}`),
};
