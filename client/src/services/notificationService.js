import api from "./api";

export const notificationService = {
  getAll: (params) => api.get("/notifications", { params }).then((res) => res.data),
  getById: (id) => api.get(`/notifications/${id}`).then((res) => res.data),
  create: (data) => api.post("/notifications", data).then((res) => res.data),
  update: (id, data) => api.put(`/notifications/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
};
