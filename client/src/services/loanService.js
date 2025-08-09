import api from "./api";

class LoanService {
  // Get all loans
  async getLoans(params = {}) {
    const response = await api.get("/loans", { params });
    return response.data;
  }

  // Get loan by ID
  async getLoan(id) {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  }

  // Create new loan
  async createLoan(loanData) {
    const response = await api.post("/loans", loanData);
    return response.data;
  }

  // Update loan
  async updateLoan(id, loanData) {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  }

  // Delete loan
  async deleteLoan(id) {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  }

  // Approve loan
  async approveLoan(id, approvalData) {
    const response = await api.put(`/loans/${id}/approve`, approvalData);
    return response.data;
  }

  // Reject loan
  async rejectLoan(id, rejectionData) {
    const response = await api.put(`/loans/${id}/reject`, rejectionData);
    return response.data;
  }

  // Get loan statistics
  async getLoanStats() {
    const response = await api.get("/loans/stats");
    return response.data;
  }

  // Get pending loans
  async getPendingLoans() {
    const response = await api.get("/loans/pending");
    return response.data;
  }

  // Get overdue loans
  async getOverdueLoans() {
    const response = await api.get("/loans/overdue");
    return response.data;
  }

  // Get member loans
  async getMemberLoans(memberId) {
    const response = await api.get(`/loans/member/${memberId}`);
    return response.data;
  }

  // Get group loans
  async getGroupLoans(groupId) {
    const response = await api.get(`/loans/group/${groupId}`);
    return response.data;
  }
}

export const loanService = new LoanService(); 