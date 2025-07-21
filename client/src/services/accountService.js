import api from "../lib/axios";

export const accountService = {
  getAll: (params) => api.get("/accounts", { params }).then((res) => res.data),
  getById: (id) => api.get(`/accounts/${id}`).then((res) => res.data),
  create: (data) => api.post("/accounts", data).then((res) => res.data),
  update: (id, data) =>
    api.put(`/accounts/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/accounts/${id}`).then((res) => res.data),
};
