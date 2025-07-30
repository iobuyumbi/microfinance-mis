// src/services/contributionService.js (REVISED)
import api from "./api";
import { handleRequest } from "./handleRequest";

export const contributionService = {
  // Get all contributions (system-wide, filtered by role)
  getAll: (
    params // Added params for potential filtering on the client side
  ) =>
    handleRequest(
      () => api.get("/contributions", { params }),
      "Failed to fetch contributions"
    ),

  // Get contributions by group
  getByGroup: (
    groupId,
    params // Added params for potential filtering
  ) =>
    handleRequest(
      () =>
        api.get(`/contributions/groups/${groupId}/contributions`, { params }), // Corrected path
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

  // Update contribution (for non-financial fields, or status changes that require separate adjustment)
  update: (id, data) =>
    handleRequest(
      () => api.put(`/contributions/${id}`, data),
      "Failed to update contribution"
    ),

  // Delete contribution (soft-delete, requires financial reversal via adjustment)
  delete: (id) =>
    handleRequest(
      () => api.delete(`/contributions/${id}`),
      "Failed to delete contribution"
    ),

  // Get contribution summary for a group
  getSummary: (
    groupId,
    params // Added params for potential filtering
  ) =>
    handleRequest(
      () =>
        api.get(`/contributions/groups/${groupId}/contributions/summary`, {
          params,
        }), // Corrected path
      "Failed to fetch contribution summary"
    ),

  // Bulk import contributions for a group
  bulkImport: (groupId, data) =>
    handleRequest(
      () =>
        api.post(`/contributions/groups/${groupId}/contributions/bulk`, data), // Corrected path
      "Failed to import contributions"
    ),

  // Export contributions for a group
  export: (
    groupId,
    format = "json",
    params // Added params for potential filtering
  ) =>
    api.get(
      `/contributions/groups/${groupId}/contributions/export?format=${format}`,
      {
        params,
        responseType: "blob", // Important for file downloads
      }
    ),

  // Get member contribution history
  getMemberHistory: (
    memberId,
    params // Added params for potential filtering
  ) =>
    handleRequest(
      () =>
        api.get(`/contributions/members/${memberId}/contributions`, { params }), // Corrected path
      "Failed to fetch member contribution history"
    ),

  // Removed: updateMemberContribution (no corresponding backend route for direct update on /members/:memberId/contributions)
  // Removed: getStats (no corresponding backend route)
};
