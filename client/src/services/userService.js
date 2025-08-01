// client\src\services\userService.js (FINAL REVISED VERSION - Corrected Duplicate)
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const userService = {
  getAll: (params) =>
    api.get(ENDPOINTS.USERS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.USERS.BY_ID(id)),

  create: (userData) =>
    api.post(ENDPOINTS.USERS.BASE, userData),

  deleteUser: (id) =>
    api.delete(ENDPOINTS.USERS.BY_ID(id)),

  getUserGroups: (userId) =>
    api.get(ENDPOINTS.USERS.GROUPS(userId)),

  getGroupMembers: (groupId) =>
    api.get(ENDPOINTS.USERS.GROUP_MEMBERS(groupId)),

  updateGroupMemberRole: (groupId, memberId, roleData) =>
    api.put(ENDPOINTS.USERS.GROUP_MEMBER_ROLE(groupId, memberId), roleData),

  updateGroupMemberStatus: (groupId, memberId, statusData) =>
    api.put(ENDPOINTS.USERS.GROUP_MEMBER_STATUS(groupId, memberId), statusData),

  addMemberToGroup: (groupId, memberData) =>
    api.post(ENDPOINTS.USERS.GROUP_MEMBERS(groupId), memberData),

  removeMemberFromGroup: (groupId, memberId) =>
    api.delete(ENDPOINTS.USERS.GROUP_MEMBER(groupId, memberId)),

  getUserFinancialSummary: (userId) =>
    api.get(ENDPOINTS.USERS.FINANCIAL_SUMMARY(userId)),

  updateProfile: (profileData) =>
    api.put(ENDPOINTS.USERS.PROFILE, profileData),

  updateUserRoleAndStatus: (userId, roleStatusData) =>
    api.put(ENDPOINTS.USERS.BY_ID(userId), roleStatusData),
};
