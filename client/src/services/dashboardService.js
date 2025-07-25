import api from './api';
import { handleRequest } from './handleRequest';

export const dashboardService = {
 
  getStats: () =>
    handleRequest(() => api.get('/reports/dashboard'), 'Unable to load dashboard statistics'),
};
