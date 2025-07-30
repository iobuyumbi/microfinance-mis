// client\src\services\groupService.js (REVISED)
import api from "./api";
import { handleRequest } from "./handleRequest";

export const groupService = {
  getAll: (params) =>
    handleRequest(
      () => api.get("/groups", { params }),
      "Unable to load groups"
    ),

  getById: (id) =>
    handleRequest(
      () => api.get(`/groups/${id}`),
      `Group with ID ${id} not found`
    ),

  create: (data) =>
    handleRequest(() => api.post("/groups", data), "Could not create group"),

  update: (id, data) =>
    handleRequest(
      () => api.put(`/groups/${id}`, data),
      `Could not update group ${id}`
    ),

  // Deletes the group itself
  remove: (id) =>
    handleRequest(
      () => api.delete(`/groups/${id}`),
      `Could not delete group ${id}`
    ),

  // --- NEW/REVISED: Member Management within a Group ---

  // Add a member to a group
  // Maps to POST /api/groups/:groupId/members
  addMember: (groupId, memberData) =>
    handleRequest(
      () => api.post(`/groups/${groupId}/members`, memberData),
      `Could not add member to group ${groupId}`
    ),

  // Remove a member from a group
  // Maps to DELETE /api/groups/:groupId/members/:userId
  removeMember: (groupId, userId, newLeaderId = null) => {
    // newLeaderId is optional, used if the current leader is being removed
    const config = newLeaderId ? { data: { newLeaderId } } : {};
    return handleRequest(
      () => api.delete(`/groups/${groupId}/members/${userId}`, config),
      `Could not remove member ${userId} from group ${groupId}`
    );
  },

  // Update a member's role within a group
  // Maps to PUT /api/groups/:groupId/members/:userId/role
  updateMemberRole: (groupId, userId, newRoleName) =>
    handleRequest(
      () =>
        api.put(`/groups/${groupId}/members/${userId}/role`, { newRoleName }),
      `Could not update role for member ${userId} in group ${groupId}`
    ),

  // Get members of a specific group
  // Maps to GET /api/groups/:groupId/members
  getGroupMembers: (groupId) =>
    handleRequest(
      () => api.get(`/groups/${groupId}/members`),
      `Could not load members for group ${groupId}`
    ),

  // Allow a user to join a group (self-service)
  // Maps to POST /api/groups/:groupId/join
  joinGroup: (groupId) =>
    handleRequest(
      () => api.post(`/groups/${groupId}/join`),
      `Could not join group ${groupId}`
    ),
};

// --- Recommendation: Move this to userService.js if not already there ---
// export const getUserGroups = (userId) =>
//   handleRequest(
//     () => api.get(`/users/${userId}/groups`),
//     `Could not load groups for user ${userId}`
//   );
