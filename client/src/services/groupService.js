import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const groupService = {
  getAll: (params) => api.get(ENDPOINTS.GROUPS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.GROUPS.BY_ID(id)),

  create: (groupData) => api.post(ENDPOINTS.GROUPS.BASE, groupData),

  update: (id, groupData) => api.put(ENDPOINTS.GROUPS.BY_ID(id), groupData),

  delete: (id) => api.delete(ENDPOINTS.GROUPS.BY_ID(id)),

  getMembers: (groupId) => api.get(ENDPOINTS.GROUPS.MEMBERS(groupId)),

  addMember: (groupId, memberData) =>
    api.post(ENDPOINTS.GROUPS.MEMBERS(groupId), memberData),

  removeMember: (groupId, memberId) =>
    api.delete(`${ENDPOINTS.GROUPS.MEMBERS(groupId)}/${memberId}`),
};
