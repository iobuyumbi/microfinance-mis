// src/services/reportService.js
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const reportService = {
  getDashboardStats: (params) =>
    api.get(ENDPOINTS.REPORTS.DASHBOARD, { params }),

  getFinancialSummary: (params) =>
    api.get(ENDPOINTS.REPORTS.FINANCIAL_SUMMARY, { params }),

  getUpcomingRepayments: (params) =>
    api.get(ENDPOINTS.REPORTS.UPCOMING_REPAYMENTS, { params }),

  getDefaulters: (params) =>
    api.get(ENDPOINTS.REPORTS.DEFAULTERS, { params }),

  getTotalLoans: (params) =>
    api.get(ENDPOINTS.REPORTS.TOTAL_LOANS, { params }),

  getGroupSavings: (params) =>
    api.get(ENDPOINTS.REPORTS.GROUP_SAVINGS, { params }),

  getLoanReports: (params) =>
    api.get(ENDPOINTS.LOANS.BASE, { params }),

  getLoanPortfolioHealth: () =>
    api.get(ENDPOINTS.REPORTS.LOAN_PORTFOLIO_HEALTH),

  getMemberReports: (params) =>
    api.get(ENDPOINTS.REPORTS.MEMBERS, { params }),

  getMemberStats: () =>
    api.get(ENDPOINTS.REPORTS.MEMBER_STATS),

  getSavingsReports: (params) =>
    api.get(ENDPOINTS.SAVINGS.BASE, { params }),

  getSavingsStats: () =>
    api.get(ENDPOINTS.REPORTS.SAVINGS_STATS),

  getTransactionReports: (params) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, { params }),

  exportReport: (type, format, params) =>
    api.get(ENDPOINTS.REPORTS.EXPORT(type, format), {
      params,
      responseType: "blob",
    }),
};
