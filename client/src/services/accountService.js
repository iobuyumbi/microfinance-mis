import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const accountService = {
  getAll: (params) => api.get(ENDPOINTS.ACCOUNTS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.ACCOUNTS.BY_ID(id)),

  create: (data) => api.post(ENDPOINTS.ACCOUNTS.BASE, data),

  update: (id, data) => api.put(ENDPOINTS.ACCOUNTS.BY_ID(id), data),

  remove: (id) => api.delete(ENDPOINTS.ACCOUNTS.BY_ID(id)),
};
