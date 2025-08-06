// client/src/services/memberService.js
import { api } from "./api/client";

export const memberService = {
  // === MEMBER MANAGEMENT ===

  // Create a new member
  createMember: (memberData) => api.post("/members", memberData),

  // Get all members (with optional filtering)
  getAllMembers: (params) => api.get("/members", { params }),

  // Get a single member by ID
  getMemberById: (id) => api.get(`/members/${id}`),

  // Update a member's details
  updateMember: (id, memberData) => api.put(`/members/${id}`, memberData),

  // Delete/Deactivate a member
  deleteMember: (id) => api.delete(`/members/${id}`),

  // === GROUP MANAGEMENT ===

  // Create a new group
  createGroup: (groupData) => api.post("/groups", groupData),

  // Get all groups (with optional filtering)
  getAllGroups: (params) => api.get("/groups", { params }),

  // Get a single group by ID
  getGroupById: (id) => api.get(`/groups/${id}`),

  // Update a group's details
  updateGroup: (id, groupData) => api.put(`/groups/${id}`, groupData),

  // Delete/Dissolve a group
  deleteGroup: (id) => api.delete(`/groups/${id}`),

  // === GROUP MEMBERSHIP MANAGEMENT ===

  // Add a member to a group
  addMemberToGroup: (memberId, groupId, memberData = {}) =>
    api.post(`/members/${memberId}/groups/${groupId}`, memberData),

  // Remove a member from a group
  removeMemberFromGroup: (memberId, groupId, newLeaderId = null) => {
    const config = newLeaderId ? { data: { newLeaderId } } : {};
    return api.delete(`/members/${memberId}/groups/${groupId}`, config);
  },

  // Update a member's role within a group
  updateMemberRoleInGroup: (memberId, groupId, roleData) =>
    api.put(`/members/${memberId}/groups/${groupId}/role`, roleData),

  // Get all members of a specific group
  getGroupMembers: (groupId) => api.get(`/groups/${groupId}/members`),

  // Allow a user to join a group (self-service)
  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),

  // === USER-GROUP RELATIONSHIPS ===

  // Get all groups that a user is a member of
  getUserGroups: (userId) => api.get(`/users/${userId}/groups`),
};
