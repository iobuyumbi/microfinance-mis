import api from './api';
import { handleRequest } from './handleRequest';

export const dashboardService = {
  // Get comprehensive dashboard statistics
  getStats: () =>
    handleRequest(() => api.get('/reports/dashboard'), 'Unable to load dashboard statistics'),

  // Get recent activity for dashboard
  getRecentActivity: () =>
    handleRequest(() => api.get('/reports/recent-activity'), 'Unable to load recent activity'),

  // Get upcoming payments
  getUpcomingPayments: () =>
    handleRequest(() => api.get('/reports/upcoming-repayments'), 'Unable to load upcoming payments'),

  // Get financial summary for dashboard
  getFinancialSummary: (params = {}) =>
    handleRequest(() => api.get('/reports/financial-summary', { params }), 'Unable to load financial summary'),

  // Get group performance data
  getGroupPerformance: () =>
    handleRequest(() => api.get('/reports/group-savings-performance'), 'Unable to load group performance'),

  // Get loan defaulters
  getLoanDefaulters: () =>
    handleRequest(() => api.get('/reports/active-loan-defaulters'), 'Unable to load loan defaulters'),
};
