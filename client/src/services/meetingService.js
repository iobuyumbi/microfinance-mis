import api from "../lib/axios";

export const meetingService = {
  getAll: (params) => api.get("/meetings", { params }).then((res) => res.data),
  getById: (id) => api.get(`/meetings/${id}`).then((res) => res.data),
  create: (data) => api.post("/meetings", data).then((res) => res.data),
  update: (id, data) =>
    api.put(`/meetings/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/meetings/${id}`).then((res) => res.data),
};
