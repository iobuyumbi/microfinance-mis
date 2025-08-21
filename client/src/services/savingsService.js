// client\src\services\savingsService.js (REVISED)
import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const savingsService = {
  getAll: (params) => api.get(ENDPOINTS.SAVINGS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.SAVINGS.BY_ID(id)),

  create: (data) => api.post(ENDPOINTS.SAVINGS.BASE, data),

  update: (id, data) => api.put(ENDPOINTS.SAVINGS.BY_ID(id), data),

  remove: (id) => api.delete(ENDPOINTS.SAVINGS.BY_ID(id)),

  recordDeposit: (accountId, data) =>
    api.post(ENDPOINTS.SAVINGS.DEPOSIT_ANY(), { accountId, ...data }),

  recordWithdrawal: (accountId, data) =>
    api.post(ENDPOINTS.SAVINGS.WITHDRAW_ANY(), { accountId, ...data }),

  getAccountTransactions: (id, params) =>
    api.get(ENDPOINTS.SAVINGS.TRANSACTIONS(id), { params }),

  // Get member savings accounts
  getMemberSavings: (memberId, params = {}) =>
    api.get(ENDPOINTS.SAVINGS.BASE, {
      params: { ...params, owner: memberId, ownerModel: "User" },
    }),

  // Get group savings accounts
  getGroupSavings: (groupId, params = {}) =>
    api.get(ENDPOINTS.SAVINGS.BASE, {
      params: { ...params, owner: groupId, ownerModel: "Group" },
    }),

  // Get savings statistics
  getStats: (params = {}) => api.get(ENDPOINTS.SAVINGS.STATS, { params }),
};
