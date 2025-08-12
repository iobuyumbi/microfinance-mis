import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

class LoanService {
  // Get all loans
  async getLoans(params = {}) {
    const response = await api.get(ENDPOINTS.LOANS.BASE, { params });
    return response.data;
  }

  // Get loan by ID
  async getLoan(id) {
    const response = await api.get(ENDPOINTS.LOANS.BY_ID(id));
    return response.data;
  }

  // Create new loan
  async createLoan(loanData) {
    const response = await api.post(ENDPOINTS.LOANS.BASE, loanData);
    return response.data;
  }

  // Update loan
  async updateLoan(id, loanData) {
    const response = await api.put(ENDPOINTS.LOANS.BY_ID(id), loanData);
    return response.data;
  }

  // Delete loan
  async deleteLoan(id) {
    const response = await api.delete(ENDPOINTS.LOANS.BY_ID(id));
    return response.data;
  }

  // Approve loan
  async approveLoan(id, approvalData) {
    const response = await api.put(ENDPOINTS.LOANS.APPROVE(id), approvalData);
    return response.data;
  }

  // Reject loan
  async rejectLoan(id, rejectionData) {
    const response = await api.put(ENDPOINTS.LOANS.REJECT(id), rejectionData);
    return response.data;
  }

  // Disburse loan
  async disburseLoan(id, disbursementData) {
    const response = await api.put(ENDPOINTS.LOANS.DISBURSE(id), disbursementData);
    return response.data;
  }

  // Get loan repayment schedule
  async getRepaymentSchedule(id) {
    const response = await api.get(ENDPOINTS.LOANS.REPAYMENT_SCHEDULE(id));
    return response.data;
  }

  // Add loan payment
  async addPayment(id, paymentData) {
    const response = await api.post(ENDPOINTS.LOANS.ADD_PAYMENT(id), paymentData);
    return response.data;
  }

  // Get loan payments
  async getPayments(id) {
    const response = await api.get(ENDPOINTS.LOANS.PAYMENTS(id));
    return response.data;
  }

  // Get loan statistics
  async getLoanStats() {
    const response = await api.get(ENDPOINTS.LOANS.STATS);
    return response.data;
  }

  // Get pending loans
  async getPendingLoans() {
    const response = await api.get(ENDPOINTS.LOANS.BASE, { params: { status: 'pending' } });
    return response.data;
  }

  // Get overdue loans
  async getOverdueLoans() {
    const response = await api.get(ENDPOINTS.LOANS.BASE, { params: { status: 'overdue' } });
    return response.data;
  }

  // Get member loans
  async getMemberLoans(memberId) {
    const response = await api.get(ENDPOINTS.LOANS.BASE, { params: { borrower: memberId, borrowerModel: 'User' } });
    return response.data;
  }

  // Get group loans
  async getGroupLoans(groupId) {
    const response = await api.get(ENDPOINTS.LOANS.BASE, { params: { borrower: groupId, borrowerModel: 'Group' } });
    return response.data;
  }
}

export const loanService = new LoanService();