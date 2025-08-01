import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const repaymentService = {
  getAll: (params) => api.get(ENDPOINTS.REPAYMENTS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.REPAYMENTS.BY_ID(id)),

  create: (data) => api.post(ENDPOINTS.REPAYMENTS.BASE, data),

  void: (id, reasonData) => api.put(ENDPOINTS.REPAYMENTS.VOID(id), reasonData),
};
