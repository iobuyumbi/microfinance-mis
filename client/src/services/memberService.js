import { api } from "./api/client";

class MemberService {
  // Get all members
  async getMembers(params = {}) {
    const response = await api.get("/members", { params });
    return response;
  }

  // Get member by ID
  async getMember(id) {
    const response = await api.get(`/members/${id}`);
    return response;
  }

  // Create new member
  async createMember(memberData) {
    const response = await api.post("/members", memberData);
    return response;
  }

  // Update member
  async updateMember(id, memberData) {
    const response = await api.put(`/members/${id}`, memberData);
    return response;
  }

  // Delete member
  async deleteMember(id) {
    const response = await api.delete(`/members/${id}`);
    return response;
  }

  // Get member statistics
  async getMemberStats() {
    const response = await api.get("/members/stats");
    return response;
  }

  // Get members by group (align to server users router)
  async getMembersByGroup(groupId) {
    const response = await api.get(`/users/groups/${groupId}/members`);
    return response;
  }

  // Add member to group
  async addMemberToGroup(memberId, groupId, roleInGroup = "member") {
    const response = await api.post(`/members/${memberId}/groups/${groupId}`, {
      roleInGroup,
    });
    return response;
  }

  // Remove member from group
  async removeMemberFromGroup(memberId, groupId) {
    const response = await api.delete(`/members/${memberId}/groups/${groupId}`);
    return response;
  }
}

export const memberService = new MemberService();
