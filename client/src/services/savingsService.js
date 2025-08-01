// client\src\services\savingsService.js (REVISED)
import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const savingsService = {
  getAll: (params) =>
    api.get(ENDPOINTS.SAVINGS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.SAVINGS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.SAVINGS.BASE, data),

  update: (id, data) =>
    api.put(ENDPOINTS.SAVINGS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.SAVINGS.BY_ID(id)),

  recordDeposit: (data) =>
    api.post(ENDPOINTS.SAVINGS.DEPOSIT, data),

  recordWithdrawal: (data) =>
    api.post(ENDPOINTS.SAVINGS.WITHDRAW, data),

  getAccountTransactions: (id, params) =>
    api.get(ENDPOINTS.SAVINGS.TRANSACTIONS(id), { params }),
};
