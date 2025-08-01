// src/services/meetingService.js
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const meetingService = {
  getAll: (params) =>
    api.get(ENDPOINTS.MEETINGS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.MEETINGS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.MEETINGS.BASE, data),

  update: (id, data) =>
    api.put(ENDPOINTS.MEETINGS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.MEETINGS.BY_ID(id)),
};