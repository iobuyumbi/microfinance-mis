import api from "./api";

export const transactionService = {
  getAll: (params) => api.get("/transactions", { params }).then((res) => res.data),
  getById: (id) => api.get(`/transactions/${id}`).then((res) => res.data),
  create: (data) => api.post("/transactions", data).then((res) => res.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/transactions/${id}`).then((res) => res.data),
};
