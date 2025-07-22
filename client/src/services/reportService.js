import api from "./api";

export const reportService = {
  getDashboardStats: () => api.get("/reports/dashboard").then(res => res.data.data),
  getFinancialSummary: (params) => api.get("/reports/financial-summary", { params }).then(res => res.data.data),
  getUpcomingRepayments: (params) => api.get("/reports/upcoming-repayments", { params }).then(res => res.data.data),
  getDefaulters: (params) => api.get("/reports/defaulters", { params }).then(res => res.data.data),
  getTotalLoans: (params) => api.get("/reports/total-loans", { params }).then(res => res.data.data),
  getGroupSavings: (params) => api.get("/reports/group-savings", { params }).then(res => res.data.data),
  getLoanReports: (params) => api.get("/loans", { params }).then(res => res.data.data),
  getLoanPortfolioHealth: () => api.get("/reports/loan-portfolio-health").then(res => res.data.data),
  getMemberReports: (params) => api.get("/reports/members", { params }).then(res => res.data.data),
  getMemberStats: () => api.get("/reports/member-stats").then(res => res.data.data),
  getSavingsReports: (params) => api.get("/savings", { params }).then(res => res.data.data),
  getSavingsStats: () => api.get("/reports/savings-stats").then(res => res.data.data),
  getTransactionReports: (params) => api.get("/transactions", { params }).then(res => res.data.data),
  exportReport: (type, format, params) => api.get(`/reports/export/${type}/${format}`, { params, responseType: 'blob' }),
};
