
import api from './api/client';

export const loanService = {
  // Get all loans
  getAllLoans: async () => {
    try {
      const response = await api.get('/loans');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.getAllLoans error:', error);
      throw error;
    }
  },

  // Get loan by ID
  getLoanById: async (id) => {
    try {
      const response = await api.get(`/loans/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.getLoanById error:', error);
      throw error;
    }
  },

  // Create new loan
  createLoan: async (loanData) => {
    try {
      const response = await api.post('/loans', loanData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.createLoan error:', error);
      throw error;
    }
  },

  // Update loan
  updateLoan: async (id, loanData) => {
    try {
      const response = await api.put(`/loans/${id}`, loanData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.updateLoan error:', error);
      throw error;
    }
  },

  // Delete loan
  deleteLoan: async (id) => {
    try {
      const response = await api.delete(`/loans/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.deleteLoan error:', error);
      throw error;
    }
  },

  // Update loan status
  updateLoanStatus: async (id, status) => {
    try {
      const response = await api.patch(`/loans/${id}/status`, { status });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.updateLoanStatus error:', error);
      throw error;
    }
  },

  // Get loans by borrower
  getLoansByBorrower: async (borrowerId) => {
    try {
      const response = await api.get(`/loans/borrower/${borrowerId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.getLoansByBorrower error:', error);
      throw error;
    }
  },

  // Get loans by group
  getLoansByGroup: async (groupId) => {
    try {
      const response = await api.get(`/loans/group/${groupId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.getLoansByGroup error:', error);
      throw error;
    }
  },

  // Process loan repayment
  processRepayment: async (loanId, repaymentData) => {
    try {
      const response = await api.post(`/loans/${loanId}/repayments`, repaymentData);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.processRepayment error:', error);
      throw error;
    }
  },

  // Get loan statistics
  getLoanStats: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/loans/stats${queryParams ? `?${queryParams}` : ''}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.getLoanStats error:', error);
      throw error;
    }
  },

  // Generate loan report
  generateLoanReport: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/loans/reports${queryParams ? `?${queryParams}` : ''}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.generateLoanReport error:', error);
      throw error;
    }
  },

  // Calculate loan eligibility
  calculateEligibility: async (borrowerId, amount) => {
    try {
      const response = await api.post('/loans/calculate-eligibility', {
        borrowerId,
        amount
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('LoanService.calculateEligibility error:', error);
      throw error;
    }
  }
};
