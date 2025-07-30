// client\src\services\userService.js (FINAL REVISED VERSION)
import api from "./api";
import { handleRequest } from "./handleRequest";

export const userService = {
  getAll: (params) =>
    handleRequest(
      () => api.get("/users", { params }),
      "Failed to fetch all users"
    ),

  getById: (id) =>
    handleRequest(() => api.get(`/users/${id}`), "Failed to fetch user by ID"),

  // --- RE-ENABLED & REFINED: Create a new user ---
  // Maps to POST /api/users
  // Data should include { name, email, password, role, etc. }
  create: (userData) =>
    handleRequest(() => api.post("/users", userData), "Failed to create user"),
  // ------------------------------------------------

  // Delete user (admin only) - maps to DELETE /users/:id
  deleteUser: (id) =>
    handleRequest(() => api.delete(`/users/${id}`), "Failed to delete user"),

  // Get user's groups - maps to GET /users/:id/groups
  getUserGroups: (userId) =>
    handleRequest(
      () => api.get(`/users/${userId}/groups`),
      "Failed to fetch user groups"
    ),

  // Get group members - maps to GET /users/groups/:groupId/members
  getGroupMembers: (groupId) =>
    handleRequest(
      () => api.get(`/users/groups/${groupId}/members`),
      "Failed to fetch group members"
    ),

  // Update group member role - maps to PUT /users/groups/:groupId/members/:memberId/role
  updateGroupMemberRole: (groupId, memberId, roleData) =>
    handleRequest(
      () =>
        api.put(`/users/groups/${groupId}/members/${memberId}/role`, roleData),
      "Failed to update group member role"
    ),

  // Update group member status - maps to PUT /users/groups/:groupId/members/:memberId/status
  updateGroupMemberStatus: (groupId, memberId, statusData) =>
    handleRequest(
      () =>
        api.put(
          `/users/groups/${groupId}/members/${memberId}/status`,
          statusData
        ),
      "Failed to update group member status"
    ),

  // Add member to group - maps to POST /users/groups/:groupId/members
  addMemberToGroup: (groupId, memberData) =>
    handleRequest(
      () => api.post(`/users/groups/${groupId}/members`, memberData),
      "Failed to add member to group"
    ),

  // Remove member from group - maps to DELETE /users/groups/:groupId/members/:memberId
  removeMemberFromGroup: (groupId, memberId) =>
    handleRequest(
      () => api.delete(`/users/groups/${groupId}/members/${memberId}`),
      "Failed to remove member from group"
    ),

  // Get user's financial summary - maps to GET /users/:id/financial-summary
  getUserFinancialSummary: (userId) =>
    handleRequest(
      () => api.get(`/users/${userId}/financial-summary`),
      "Failed to fetch financial summary"
    ),

  // Update current user's profile - maps to PUT /users/profile
  updateProfile: (profileData) =>
    handleRequest(
      () => api.put("/users/profile", profileData),
      "Failed to update profile"
    ),

  // Update any user's role and status (admin/officer/leader only) - maps to PUT /users/:id
  // Renamed from 'updateRoleStatus' to 'updateUserRoleAndStatus' for more clarity
  // This replaces the old 'update' function
  updateUserRoleAndStatus: (userId, roleStatusData) =>
    handleRequest(
      () => api.put(`/users/${userId}`, roleStatusData),
      "Failed to update user role/status"
    ),
};
