import api from './api';
import { handleRequest } from './handleRequest';

export const settingsService = {
  get: () =>
    handleRequest(() => api.get('/settings'), 'Failed to load settings'),

  update: (data) =>
    handleRequest(() => api.put('/settings', data), 'Failed to update settings'),
};
