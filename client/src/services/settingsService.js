import api from './api';

export const settingsService = {
  get: () => api.get('/settings').then(res => res.data.data),
  update: (data) => api.put('/settings', data).then(res => res.data.data),
}; 