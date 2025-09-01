
import apiClient from './api/client';

class SettingsService {
  async getSettings() {
    try {
      const response = await apiClient.get('/settings');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  }

  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/settings', settings);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }

  async resetSettings() {
    try {
      const response = await apiClient.post('/settings/reset');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset settings');
    }
  }

  async getSettingCategory(category) {
    try {
      const response = await apiClient.get(`/settings/${category}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to fetch ${category} settings`);
    }
  }

  async updateSettingCategory(category, data) {
    try {
      const response = await apiClient.put(`/settings/${category}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to update ${category} settings`);
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
