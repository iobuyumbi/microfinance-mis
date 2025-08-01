import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const contributionService = {
  getAll: (params) => api.get(ENDPOINTS.CONTRIBUTIONS.BASE, { params }),

  getByGroup: (groupId, params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.BY_GROUP(groupId), { params }),

  getById: (id) => api.get(ENDPOINTS.CONTRIBUTIONS.BY_ID(id)),

  create: (data) => api.post(ENDPOINTS.CONTRIBUTIONS.BASE, data),

  update: (id, data) => api.put(ENDPOINTS.CONTRIBUTIONS.BY_ID(id), data),

  delete: (id) => api.delete(ENDPOINTS.CONTRIBUTIONS.BY_ID(id)),

  getSummary: (groupId, params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.SUMMARY(groupId), { params }),

  bulkImport: (groupId, data) =>
    api.post(ENDPOINTS.CONTRIBUTIONS.BULK_IMPORT(groupId), data),

  export: (groupId, format = "json", params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.EXPORT(groupId, format), {
      params,
      responseType: "blob",
    }),

  getMemberHistory: (memberId, params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.MEMBER_HISTORY(memberId), { params }),
};
