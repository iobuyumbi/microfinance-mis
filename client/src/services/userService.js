// client\src\services\userService.js (FINAL REVISED VERSION - Corrected Duplicate)
import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const userService = {
  getAll: (params) => api.get(ENDPOINTS.USERS.BASE, { params }), // expects { data: { items, total, page, limit } }

  getById: (id) => api.get(ENDPOINTS.USERS.BY_ID(id)),

  create: (userData) => api.post(ENDPOINTS.USERS.BASE, userData),

  deleteUser: (id) => api.delete(ENDPOINTS.USERS.BY_ID(id)),

  getUserGroups: (userId) => api.get(`/users/${userId}/groups`),

  getUserFinancialSummary: (userId) =>
    api.get(ENDPOINTS.USERS.FINANCIAL_SUMMARY(userId)),

  updateProfile: (profileData) => api.put(ENDPOINTS.AUTH.PROFILE, profileData),

  updateUserRoleAndStatus: (userId, roleStatusData) =>
    api.put(ENDPOINTS.USERS.BY_ID(userId), roleStatusData),
};
