import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const transactionService = {
  getAll: (params) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.TRANSACTIONS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.TRANSACTIONS.BASE, data),

  update: (id, data) =>
    api.put(ENDPOINTS.TRANSACTIONS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
};
