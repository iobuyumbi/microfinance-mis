
import { apiClient } from './api/client';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (timeRange = 'month') => {
    try {
      const response = await apiClient.get(`/dashboard/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get real-time metrics
  getRealTimeMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  },

  // Get performance indicators
  getPerformanceIndicators: async (period = '30d') => {
    try {
      const response = await apiClient.get(`/dashboard/performance?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance indicators:', error);
      throw error;
    }
  },

  // Get alerts and notifications
  getAlerts: async () => {
    try {
      const response = await apiClient.get('/dashboard/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Get transaction analytics
  getTransactionAnalytics: async (timeRange = 'week') => {
    try {
      const response = await apiClient.get(`/dashboard/transactions?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction analytics:', error);
      throw error;
    }
  },

  // Export dashboard data
  exportDashboardData: async (format = 'csv', timeRange = 'month') => {
    try {
      const response = await apiClient.get(`/dashboard/export?format=${format}&timeRange=${timeRange}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      throw error;
    }
  }
};
