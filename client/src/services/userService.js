import api from "./api";
import { handleRequest } from "./handleRequest";

export const userService = {
  getAll: (params) => handleRequest(() => api.get("/users", { params })),

  getById: (id) => handleRequest(() => api.get(`/users/${id}`)),

  create: (data) => handleRequest(() => api.post("/users", data)),

  update: (id, data) => handleRequest(() => api.put(`/users/${id}`, data)),

  remove: (id) => handleRequest(() => api.delete(`/users/${id}`)),

  // Get user's groups
  getUserGroups: (userId) =>
    handleRequest(() => api.get(`/users/${userId}/groups`)),

  // Get group members
  getGroupMembers: (groupId) =>
    handleRequest(() => api.get(`/users/groups/${groupId}/members`)),

  // Update group member role
  updateGroupMemberRole: (groupId, memberId, roleData) =>
    handleRequest(() =>
      api.put(`/users/groups/${groupId}/members/${memberId}/role`, roleData)
    ),

  // Update group member status
  updateGroupMemberStatus: (groupId, memberId, statusData) =>
    handleRequest(() =>
      api.put(`/users/groups/${groupId}/members/${memberId}/status`, statusData)
    ),

  // Add member to group
  addMemberToGroup: (groupId, memberData) =>
    handleRequest(() =>
      api.post(`/users/groups/${groupId}/members`, memberData)
    ),

  // Remove member from group
  removeMemberFromGroup: (groupId, memberId) =>
    handleRequest(() =>
      api.delete(`/users/groups/${groupId}/members/${memberId}`)
    ),

  // Get user's financial summary
  getUserFinancialSummary: (userId) =>
    handleRequest(() => api.get(`/users/${userId}/financial-summary`)),

  // Update user profile
  updateProfile: (profileData) =>
    handleRequest(() => api.put("/users/profile", profileData)),

  // Update user role and status (admin only)
  updateRoleStatus: (userId, roleStatusData) =>
    handleRequest(() => api.put(`/users/${userId}`, roleStatusData)),
};
