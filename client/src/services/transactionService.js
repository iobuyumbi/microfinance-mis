import api from './api';
import { handleRequest } from './handleRequest';

export const transactionService = {
  getAll: (params) =>
    handleRequest(() => api.get('/transactions', { params }), 'Unable to load transactions'),

  getById: (id) =>
    handleRequest(() => api.get(`/transactions/${id}`), 'Transaction not found'),

  create: (data) =>
    handleRequest(() => api.post('/transactions', data), 'Failed to create transaction'),

  update: (id, data) =>
    handleRequest(() => api.put(`/transactions/${id}`, data), 'Failed to update transaction'),

  remove: (id) =>
    handleRequest(() => api.delete(`/transactions/${id}`), 'Failed to delete transaction'),
};
