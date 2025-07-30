// client\src\services\savingsService.js (REVISED)
import api from "./api";
import { handleRequest } from "./handleRequest";

export const savingsService = {
  getAll: (params) =>
    handleRequest(
      () => api.get("/savings", { params }),
      "Failed to fetch savings"
    ),

  getById: (id) =>
    handleRequest(
      () => api.get(`/savings/${id}`),
      "Failed to fetch saving by ID"
    ),

  create: (data) =>
    handleRequest(() => api.post("/savings", data), "Failed to create saving"),

  update: (id, data) =>
    handleRequest(
      () => api.put(`/savings/${id}`, data),
      "Failed to update saving"
    ),

  remove: (id) =>
    handleRequest(
      () => api.delete(`/savings/${id}`),
      "Failed to delete saving"
    ),

  // --- NEW METHODS FOR TRANSACTION-RELATED SAVINGS OPERATIONS ---
  recordDeposit: (
    data // data should contain { accountId, amount, paymentMethod, description }
  ) =>
    handleRequest(
      () => api.post("/savings/deposit", data),
      "Failed to record deposit"
    ),

  recordWithdrawal: (
    data // data should contain { accountId, amount, paymentMethod, description }
  ) =>
    handleRequest(
      () => api.post("/savings/withdraw", data),
      "Failed to record withdrawal"
    ),

  getAccountTransactions: (
    id,
    params // id is savings account ID, params for filters if any
  ) =>
    handleRequest(
      () => api.get(`/savings/${id}/transactions`, { params }),
      "Failed to fetch account transactions"
    ),
  // --- END NEW METHODS ---
};
