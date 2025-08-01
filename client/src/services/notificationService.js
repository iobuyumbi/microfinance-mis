// src/services/notificationService.js
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const notificationService = {
  getAll: (params) =>
    api.get(ENDPOINTS.NOTIFICATIONS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.NOTIFICATIONS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.NOTIFICATIONS.BASE, data),

  update: (id, data) =>
    api.put(ENDPOINTS.NOTIFICATIONS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.NOTIFICATIONS.BY_ID(id)),
};
