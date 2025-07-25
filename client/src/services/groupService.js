import api from './api';
import { handleRequest } from './handleRequest';

export const groupService = {
  getAll: (params) =>
    handleRequest(() => api.get('/groups', { params }), 'Unable to load groups'),

  getById: (id) =>
    handleRequest(() => api.get(`/groups/${id}`), `Group with ID ${id} not found`),

  create: (data) =>
    handleRequest(() => api.post('/groups', data), 'Could not create group'),

  update: (id, data) =>
    handleRequest(() => api.put(`/groups/${id}`, data), `Could not update group ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/groups/${id}`), `Could not delete group ${id}`),

  getUserGroups: (userId) =>
    handleRequest(() => api.get(`/users/${userId}/groups`), `Could not load groups for user ${userId}`),
};
