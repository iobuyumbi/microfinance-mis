import api from "./api";
import { handleRequest } from "./handleRequest";

export const contributionService = {
  // Get all contributions
  getAll: () =>
    handleRequest(
      () => api.get("/contributions"),
      "Failed to fetch contributions"
    ),

  // Get contributions by group
  getByGroup: (groupId) =>
    handleRequest(
      () => api.get(`/groups/${groupId}/contributions`),
      "Failed to fetch group contributions"
    ),

  // Get contribution by ID
  getById: (id) =>
    handleRequest(
      () => api.get(`/contributions/${id}`),
      "Failed to fetch contribution"
    ),

  // Create new contribution
  create: (data) =>
    handleRequest(
      () => api.post("/contributions", data),
      "Failed to create contribution"
    ),

  // Update contribution
  update: (id, data) =>
    handleRequest(
      () => api.put(`/contributions/${id}`, data),
      "Failed to update contribution"
    ),

  // Delete contribution
  delete: (id) =>
    handleRequest(
      () => api.delete(`/contributions/${id}`),
      "Failed to delete contribution"
    ),

  // Get contribution summary
  getSummary: (groupId) =>
    handleRequest(
      () => api.get(`/groups/${groupId}/contributions/summary`),
      "Failed to fetch contribution summary"
    ),

  // Get contribution statistics
  getStats: (groupId) =>
    handleRequest(
      () => api.get(`/groups/${groupId}/contributions/stats`),
      "Failed to fetch contribution statistics"
    ),

  // Bulk import contributions
  bulkImport: (groupId, data) =>
    handleRequest(
      () => api.post(`/groups/${groupId}/contributions/bulk`, data),
      "Failed to import contributions"
    ),

  // Export contributions
  export: (groupId, format = "csv") =>
    handleRequest(
      () => api.get(`/groups/${groupId}/contributions/export?format=${format}`),
      "Failed to export contributions"
    ),

  // Get member contribution history
  getMemberHistory: (memberId) =>
    handleRequest(
      () => api.get(`/members/${memberId}/contributions`),
      "Failed to fetch member contribution history"
    ),

  // Update member contribution
  updateMemberContribution: (memberId, data) =>
    handleRequest(
      () => api.put(`/members/${memberId}/contributions`, data),
      "Failed to update member contribution"
    ),
};
