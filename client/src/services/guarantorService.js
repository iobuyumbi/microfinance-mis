import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const guarantorService = {
  create: (data) => api.post(ENDPOINTS.GUARANTORS.BASE, data),

  getAll: (params) => api.get(ENDPOINTS.GUARANTORS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.GUARANTORS.BY_ID(id)),

  update: (id, data) => api.put(ENDPOINTS.GUARANTORS.BY_ID(id), data),

  delete: (id) => api.delete(ENDPOINTS.GUARANTORS.BY_ID(id)),
};
