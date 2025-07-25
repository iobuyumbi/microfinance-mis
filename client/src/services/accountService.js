import api from './api';
import { handleRequest } from './handleRequest';

export const accountService = {
  getAll: (params) =>
    handleRequest(() => api.get('/accounts', { params }), 'Failed to fetch accounts'),

  getById: (id) =>
    handleRequest(() => api.get(`/accounts/${id}`), `Failed to fetch account with ID ${id}`),

  create: (data) =>
    handleRequest(() => api.post('/accounts', data), 'Failed to create account'),

  update: (id, data) =>
    handleRequest(() => api.put(`/accounts/${id}`, data), `Failed to update account with ID ${id}`),

  remove: (id) =>
    handleRequest(() => api.delete(`/accounts/${id}`), `Failed to delete account with ID ${id}`),
};
