import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

class MemberService {
  // Get all members
  async getAllMembers(params = {}) {
    const response = await api.get(ENDPOINTS.MEMBERS.BASE, { params });
    return response;
  }

  // Get member by ID
  async getMember(id) {
    const response = await api.get(ENDPOINTS.MEMBERS.BY_ID.replace(':id', id));
    return response;
  }

  // Create new member
  async createMember(memberData) {
    const response = await api.post(ENDPOINTS.MEMBERS.BASE, memberData);
    return response;
  }

  // Update member
  async updateMember(id, memberData) {
    const response = await api.put(ENDPOINTS.MEMBERS.BY_ID.replace(':id', id), memberData);
    return response;
  }

  // Delete member
  async deleteMember(id) {
    const response = await api.delete(ENDPOINTS.MEMBERS.BY_ID.replace(':id', id));
    return response;
  }

  // Get member statistics
  async getMemberStats() {
    const response = await api.get(ENDPOINTS.MEMBERS.STATS);
    return response;
  }

  // Get members by group
  async getMembersByGroup(groupId) {
    const response = await api.get(ENDPOINTS.MEMBERS.BY_GROUP.replace(':groupId', groupId));
    return response;
  }

  // Add member to group
  async addMemberToGroup(groupId, memberData) {
    const response = await api.post(ENDPOINTS.GROUPS.MEMBERS.replace(':id', groupId), memberData);
    return response;
  }

  // Remove member from group
  async removeMemberFromGroup(groupId, memberId) {
    const response = await api.delete(`${ENDPOINTS.GROUPS.MEMBERS.replace(':id', groupId)}/${memberId}`);
    return response;
  }

  // Get member activities
  async getMemberActivities(memberId) {
    const response = await api.get(`${ENDPOINTS.MEMBERS.BY_ID.replace(':id', memberId)}/activities`);
    return response;
  }
}

export const memberService = new MemberService();
