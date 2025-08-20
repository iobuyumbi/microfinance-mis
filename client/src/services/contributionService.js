import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const contributionService = {
  // Get all contributions with optional filters
  getAll: (params) => api.get(ENDPOINTS.CONTRIBUTIONS.BASE, { params }),

  // Get a single contribution by ID
  getById: (id) => api.get(ENDPOINTS.CONTRIBUTIONS.BY_ID(id)),

  // Create a new contribution
  create: (contributionData) =>
    api.post(ENDPOINTS.CONTRIBUTIONS.BASE, contributionData),

  // Update a contribution
  update: (id, contributionData) =>
    api.put(ENDPOINTS.CONTRIBUTIONS.BY_ID(id), contributionData),

  // Delete a contribution
  delete: (id) => api.delete(ENDPOINTS.CONTRIBUTIONS.BY_ID(id)),

  // Get contributions by group
  getByGroup: (groupId, params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.BY_GROUP(groupId), { params }),

  // Get contributions by member
  getByMember: (memberId, params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.BY_MEMBER(memberId), { params }),

  // Get contribution summary for a group
  getGroupSummary: (groupId) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.SUMMARY(groupId)),

  // Export contributions
  export: (params) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.EXPORT(params.groupId, "csv"), {
      params,
      responseType: "blob",
    }),

  // Get member contribution history
  getMemberHistory: (memberId) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.MEMBER_HISTORY(memberId)),

  // Bulk import contributions
  bulkImport: (groupId, contributions) =>
    api.post(ENDPOINTS.CONTRIBUTIONS.BULK_IMPORT(groupId), contributions),

  // Get contribution statistics
  // getStats removed: no matching server route

  // Get contribution reports
  // getReports removed: no matching server route
};
