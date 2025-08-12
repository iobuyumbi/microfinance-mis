import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const transactionService = {
  getAll: (params) => api.get(ENDPOINTS.TRANSACTIONS.BASE, { params }),

  getById: (id) => api.get(ENDPOINTS.TRANSACTIONS.BY_ID(id)),

  create: (data) => api.post(ENDPOINTS.TRANSACTIONS.BASE, data),

  update: (id, data) => api.put(ENDPOINTS.TRANSACTIONS.BY_ID(id), data),

  remove: (id) => api.delete(ENDPOINTS.TRANSACTIONS.BY_ID(id)),

  // Get member transactions
  getMemberTransactions: (memberId, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { ...params, memberId },
    }),

  // Get group transactions
  getGroupTransactions: (groupId, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { ...params, groupId },
    }),

  // Get transactions by type
  getByType: (type, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { ...params, type },
    }),

  // Get transactions by status
  getByStatus: (status, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { ...params, status },
    }),

  // Get transactions by date range
  getByDateRange: (startDate, endDate, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, {
      params: { ...params, startDate, endDate },
    }),

  // Get transaction statistics
  getStats: (params = {}) => api.get(ENDPOINTS.TRANSACTIONS.STATS, { params }),
};
