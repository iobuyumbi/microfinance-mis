import api from "../lib/axios";

export const memberService = {
  getAll: (params) => api.get("/members", { params }).then((res) => res.data),
  getById: (id) => api.get(`/members/${id}`).then((res) => res.data),
  create: (data) => api.post("/members", data).then((res) => res.data),
  update: (id, data) => api.put(`/members/${id}`, data).then((res) => res.data),
  remove: (id) => api.delete(`/members/${id}`).then((res) => res.data),
};
