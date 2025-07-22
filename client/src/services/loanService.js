import api from "./api";

export const loanService = {
  getAll: (params) => api.get("/loans", { params }).then((res) => res.data),
  getById: (id) => api.get(`/loans/${id}`).then((res) => res.data),
  create: (data) => api.post("/loans", data).then((res) => res.data),
  update: (id, data) => api.put(`/loans/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/loans/${id}`).then((res) => res.data),
};
