import api from "./api";

export const savingsService = {
  getAll: (params) => api.get("/savings", { params }).then((res) => res.data),
  getById: (id) => api.get(`/savings/${id}`).then((res) => res.data),
  create: (data) => api.post("/savings", data).then((res) => res.data),
  update: (id, data) => api.put(`/savings/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/savings/${id}`).then((res) => res.data),
};
