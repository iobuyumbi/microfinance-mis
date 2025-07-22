import api from './api';

export const dashboardService = {
  getStats: () => api.get('/reports/dashboard').then(res => res.data.data),
}; 