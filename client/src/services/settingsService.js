import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const settingsService = {
  get: () =>
    api.get(ENDPOINTS.SETTINGS.BASE),

  update: (data) =>
    api.put(ENDPOINTS.SETTINGS.BASE, data),

  reset: () =>
    api.post(ENDPOINTS.SETTINGS.RESET),
};
