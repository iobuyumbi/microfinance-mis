import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const dashboardService = {
  getStats: () => api.get(ENDPOINTS.REPORTS.DASHBOARD),

  getRecentActivity: () => api.get(ENDPOINTS.REPORTS.RECENT_ACTIVITY),

  getUpcomingPayments: () => api.get(ENDPOINTS.REPORTS.UPCOMING_REPAYMENTS),

  getFinancialSummary: (params = {}) =>
    api.get(ENDPOINTS.REPORTS.FINANCIAL_SUMMARY, { params }),

  getGroupPerformance: () =>
    api.get(ENDPOINTS.REPORTS.GROUP_SAVINGS_PERFORMANCE),

  getLoanDefaulters: () => api.get(ENDPOINTS.REPORTS.ACTIVE_LOAN_DEFAULTERS),
};
