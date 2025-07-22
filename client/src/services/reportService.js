import api from "../lib/axios";

export const reportService = {
  // Dashboard specific methods
  getDashboardStats: () => api.get("/reports/dashboard"),
  
  // Financial reports
  getFinancialSummary: (params) =>
    api.get("/reports/financial-summary", { params }),
  getUpcomingRepayments: (params) =>
    api.get("/reports/upcoming-repayments", { params }),
  getDefaulters: (params) =>
    api.get("/reports/defaulters", { params }),
  getTotalLoans: (params) =>
    api.get("/reports/total-loans", { params }),
  getGroupSavings: (params) =>
    api.get("/reports/group-savings", { params }),
  
  // Loan reports
  getLoanReports: (params) =>
    api.get("/reports/loans", { params }),
  getLoanPortfolioHealth: () =>
    api.get("/reports/loan-portfolio-health"),
  
  // Member reports
  getMemberReports: (params) =>
    api.get("/reports/members", { params }),
  getMemberStats: () =>
    api.get("/reports/member-stats"),
  
  // Savings reports
  getSavingsReports: (params) =>
    api.get("/reports/savings", { params }),
  getSavingsStats: () =>
    api.get("/reports/savings-stats"),
  
  // Transaction reports
  getTransactionReports: (params) =>
    api.get("/reports/transactions", { params }),
  
  // Export functions
  exportReport: (type, format, params) =>
    api.get(`/reports/export/${type}/${format}`, { 
      params,
      responseType: 'blob'
    }),
};
