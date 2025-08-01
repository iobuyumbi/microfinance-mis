// client\src\services\groupService.js (REVISED)
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const groupService = {
  getAll: (params) =>
    api.get(ENDPOINTS.GROUPS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.GROUPS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.GROUPS.BASE, data),

  update: (id, data) =>
    api.put(ENDPOINTS.GROUPS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.GROUPS.BY_ID(id)),

  addMember: (groupId, memberData) =>
    api.post(ENDPOINTS.GROUPS.MEMBERS(groupId), memberData),

  removeMember: (groupId, userId, newLeaderId = null) => {
    const config = newLeaderId ? { data: { newLeaderId } } : {};
    return api.delete(ENDPOINTS.GROUPS.MEMBER(groupId, userId), config);
  },

  updateMemberRole: (groupId, userId, newRoleName) =>
    api.put(ENDPOINTS.GROUPS.MEMBER_ROLE(groupId, userId), { newRoleName }),

  getGroupMembers: (groupId) =>
    api.get(ENDPOINTS.GROUPS.MEMBERS(groupId)),

  joinGroup: (groupId) =>
    api.post(ENDPOINTS.GROUPS.JOIN(groupId)),
};

// --- Recommendation: Move this to userService.js if not already there ---
// export const getUserGroups = (userId) =>
//   handleRequest(
//     () => api.get(`/users/${userId}/groups`),
//     `Could not load groups for user ${userId}`
//   );
