import api from "./api";

export const repaymentService = {
  getAll: (params) =>
    api.get("/repayments", { params }).then((res) => res.data),
  getById: (id) => api.get(`/repayments/${id}`).then((res) => res.data),
  create: (data) => api.post("/repayments", data).then((res) => res.data),
  update: (id, data) =>
    api.put(`/repayments/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/repayments/${id}`).then((res) => res.data),
};
