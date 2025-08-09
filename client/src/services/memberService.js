import api from "./api";

class MemberService {
  // Get all members
  async getMembers(params = {}) {
    const response = await api.get("/members", { params });
    return response.data;
  }

  // Get member by ID
  async getMember(id) {
    const response = await api.get(`/members/${id}`);
    return response.data;
  }

  // Create new member
  async createMember(memberData) {
    const response = await api.post("/members", memberData);
    return response.data;
  }

  // Update member
  async updateMember(id, memberData) {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  }

  // Delete member
  async deleteMember(id) {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  }

  // Get member statistics
  async getMemberStats() {
    const response = await api.get("/members/stats");
    return response.data;
  }

  // Get members by group
  async getMembersByGroup(groupId) {
    const response = await api.get(`/members/group/${groupId}`);
    return response.data;
  }

  // Add member to group
  async addMemberToGroup(memberId, groupId) {
    const response = await api.post(`/members/${memberId}/groups`, { groupId });
    return response.data;
  }

  // Remove member from group
  async removeMemberFromGroup(memberId, groupId) {
    const response = await api.delete(`/members/${memberId}/groups/${groupId}`);
    return response.data;
  }

  // Get member profile
  async getMemberProfile(id) {
    const response = await api.get(`/members/${id}/profile`);
    return response.data;
  }

  // Update member profile
  async updateMemberProfile(id, profileData) {
    const response = await api.put(`/members/${id}/profile`, profileData);
    return response.data;
  }
}

export const memberService = new MemberService(); 