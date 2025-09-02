
/**
 * Centralized API endpoints configuration
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to build URLs
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_BASE}${endpoint}`;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    PROFILE: '/auth/profile'
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: '/users/:id',
    STATS: '/users/stats',
    BULK: '/users/bulk'
  },

  // Groups
  GROUPS: {
    BASE: '/groups',
    BY_ID: '/groups/:id',
    MEMBERS: '/groups/:id/members',
    STATS: '/groups/stats',
    ACTIVITIES: '/groups/:id/activities'
  },

  // Members
  MEMBERS: {
    BASE: '/members',
    BY_ID: '/members/:id',
    STATS: '/members/stats',
    BY_GROUP: '/members/group/:groupId'
  },

  // Loans
  LOANS: {
    BASE: '/loans',
    BY_ID: '/loans/:id',
    APPROVE: '/loans/:id/approve',
    REPAYMENT: '/loans/:id/repayment',
    STATS: '/loans/stats',
    CALCULATE: '/loans/:id/calculate'
  },

  // Savings
  SAVINGS: {
    BASE: '/savings',
    BY_ID: '/savings/:id',
    DEPOSIT: '/savings/:id/deposit',
    WITHDRAW: '/savings/:id/withdraw',
    STATS: '/savings/stats'
  },

  // Transactions
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: '/transactions/:id',
    BY_USER: '/transactions/user/:userId',
    BY_LOAN: '/transactions/loan/:loanId',
    STATS: '/transactions/stats'
  },

  // Chat
  CHAT: {
    MESSAGES: '/chat/messages',
    BY_ID: '/chat/messages/:id',
    READ: '/chat/messages/read',
    BY_GROUP: '/chat/messages/group/:groupId'
  },

  // Meetings
  MEETINGS: {
    BASE: '/meetings',
    BY_ID: '/meetings/:id',
    BY_GROUP: '/meetings/group/:groupId',
    ATTENDANCE: '/meetings/:id/attendance'
  },

  // Reports
  REPORTS: {
    FINANCIAL: '/reports/financial',
    LOANS: '/reports/loans',
    SAVINGS: '/reports/savings',
    GROUPS: '/reports/groups',
    CUSTOM: '/reports/custom'
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: '/notifications/:id',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all'
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    BY_KEY: '/settings/:key'
  },

  // Health & System
  HEALTH: '/health',
  STATUS: '/status',
  INFO: '/info'
};

// Export individual endpoint builders
export const getEndpoint = (endpoint, params = {}) => buildUrl(endpoint, params);

export default ENDPOINTS;
