
import apiClient from './api/client';

const ENDPOINTS = {
  SAVINGS: '/savings',
  SAVINGS_STATS: '/savings/stats',
  SAVINGS_BY_ID: (id) => `/savings/${id}`,
  SAVINGS_TRANSACTIONS: (id) => `/savings/${id}/transactions`,
  SAVINGS_DEPOSIT: (id) => `/savings/${id}/deposit`,
  SAVINGS_WITHDRAW: (id) => `/savings/${id}/withdraw`
};

export const savingsService = {
  // Get all savings accounts
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.SAVINGS, { params });
    return response.data;
  },

  // Get savings statistics
  async getStats() {
    const response = await apiClient.get(ENDPOINTS.SAVINGS_STATS);
    return response.data;
  },

  // Get savings account by ID
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.SAVINGS_BY_ID(id));
    return response.data;
  },

  // Create new savings account
  async create(savingsData) {
    const response = await apiClient.post(ENDPOINTS.SAVINGS, savingsData);
    return response.data;
  },

  // Update savings account
  async update(id, savingsData) {
    const response = await apiClient.put(ENDPOINTS.SAVINGS_BY_ID(id), savingsData);
    return response.data;
  },

  // Delete savings account
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.SAVINGS_BY_ID(id));
    return response.data;
  },

  // Get savings transactions
  async getTransactions(id, params = {}) {
    const response = await apiClient.get(ENDPOINTS.SAVINGS_TRANSACTIONS(id), { params });
    return response.data;
  },

  // Make deposit
  async deposit(id, depositData) {
    const response = await apiClient.post(ENDPOINTS.SAVINGS_DEPOSIT(id), depositData);
    return response.data;
  },

  // Make withdrawal
  async withdraw(id, withdrawalData) {
    const response = await apiClient.post(ENDPOINTS.SAVINGS_WITHDRAW(id), withdrawalData);
    return response.data;
  },

  // Get savings by member
  async getByMember(memberId) {
    const response = await apiClient.get(ENDPOINTS.SAVINGS, { 
      params: { member: memberId } 
    });
    return response.data;
  },

  // Get savings by group
  async getByGroup(groupId) {
    const response = await apiClient.get(ENDPOINTS.SAVINGS, { 
      params: { group: groupId } 
    });
    return response.data;
  },

  // Calculate interest for an account
  async calculateInterest(id) {
    const response = await apiClient.post(`${ENDPOINTS.SAVINGS_BY_ID(id)}/calculate-interest`);
    return response.data;
  },

  // Get account summary
  async getSummary(id) {
    const response = await apiClient.get(`${ENDPOINTS.SAVINGS_BY_ID(id)}/summary`);
    return response.data;
  }
};

export default savingsService;
