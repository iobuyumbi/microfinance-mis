import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const loanService = {
  getAll: (params) =>
    api.get(ENDPOINTS.LOANS.BASE, { params }),

  getById: (id) =>
    api.get(ENDPOINTS.LOANS.BY_ID(id)),

  create: (data) =>
    api.post(ENDPOINTS.LOANS.APPLY, data),

  update: (id, data) =>
    api.put(ENDPOINTS.LOANS.BY_ID(id), data),

  remove: (id) =>
    api.delete(ENDPOINTS.LOANS.BY_ID(id)),

  approve: (id, approvalData) =>
    api.put(ENDPOINTS.LOANS.APPROVE(id), approvalData),

  getStats: (params) =>
    api.get(ENDPOINTS.LOANS.STATS, { params }),

  getRepaymentSchedule: (id) =>
    api.get(ENDPOINTS.LOANS.REPAYMENT_SCHEDULE(id)),

  addPayment: (id, paymentData) =>
    api.post(ENDPOINTS.LOANS.PAYMENTS(id), paymentData),

  getPayments: (id, params) =>
    api.get(ENDPOINTS.LOANS.PAYMENTS(id), { params }),
};
