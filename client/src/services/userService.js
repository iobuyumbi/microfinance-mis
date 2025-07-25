import api from "./api";
import { handleRequest } from "./handleRequest";

export const userService = {
  getAll: (params) =>
    handleRequest(() => api.get("/users", { params })),

  getById: (id) =>
    handleRequest(() => api.get(`/users/${id}`)),

  create: (data) =>
    handleRequest(() => api.post("/users", data)),

  update: (id, data) =>
    handleRequest(() => api.put(`/users/${id}`, data)),

  remove: (id) =>
    handleRequest(() => api.delete(`/users/${id}`)),
};
