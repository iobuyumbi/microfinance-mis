// API Endpoints Configuration
// This file centralizes all API endpoints for better maintainability

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    STATUS: "/auth/status",
  },

  // Users
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    BY_ID: (id) => `/users/${id}`,
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    UPLOAD_AVATAR: "/users/avatar",
    GROUPS: (userId) => `/users/${userId}/groups`,
    GROUP_MEMBERS: (groupId) => `/groups/${groupId}/members`,
    GROUP_MEMBER_ROLE: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}/role`,
    GROUP_MEMBER_STATUS: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}/status`,
    GROUP_MEMBER: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}`,
    FINANCIAL_SUMMARY: (userId) => `/users/${userId}/financial-summary`,
  },

  // Groups
  GROUPS: {
    BASE: "/groups",
    BY_ID: (id) => `/groups/${id}`,
    MEMBERS: (id) => `/groups/${id}/members`,
    ADD_MEMBER: (id) => `/groups/${id}/members`,
    REMOVE_MEMBER: (groupId, memberId) =>
      `/groups/${groupId}/members/${memberId}`,
    ROLES: (id) => `/groups/${id}/roles`,
    SETTINGS: (id) => `/groups/${id}/settings`,
    MEMBER: (groupId, userId) => `/groups/${groupId}/members/${userId}`,
    MEMBER_ROLE: (groupId, userId) =>
      `/groups/${groupId}/members/${userId}/role`,
    JOIN: (groupId) => `/groups/${groupId}/join`,
  },

  // Loans
  LOANS: {
    BASE: "/loans",
    BY_ID: (id) => `/loans/${id}`,
    APPLY: "/loans",
    APPROVE: (id) => `/loans/${id}/approve`,
    REJECT: (id) => `/loans/${id}/reject`,
    DISBURSE: (id) => `/loans/${id}/disburse`,
    REPAYMENT_SCHEDULE: (id) => `/loans/${id}/repayment-schedule`,
    PAYMENTS: (id) => `/loans/${id}/payments`,
    ADD_PAYMENT: (id) => `/loans/${id}/payments`,
    STATS: "/loans/stats",
  },

  // Savings
  SAVINGS: {
    BASE: "/savings",
    BY_ID: (id) => `/savings/${id}`,
    DEPOSIT: (id) => `/savings/${id}/deposit`,
    WITHDRAW: (id) => `/savings/${id}/withdraw`,
    TRANSACTIONS: (id) => `/savings/${id}/transactions`,
  },

  // Transactions
  TRANSACTIONS: {
    BASE: "/transactions",
    BY_ID: (id) => `/transactions/${id}`,
    BY_TYPE: (type) => `/transactions?type=${type}`,
    BY_DATE_RANGE: (startDate, endDate) =>
      `/transactions?startDate=${startDate}&endDate=${endDate}`,
  },

  // Accounts
  ACCOUNTS: {
    BASE: "/accounts",
    BY_ID: (id) => `/accounts/${id}`,
    BY_OWNER: (ownerId, ownerModel) =>
      `/accounts?owner=${ownerId}&ownerModel=${ownerModel}`,
    CREATE: "/accounts",
    UPDATE: (id) => `/accounts/${id}`,
    DELETE: (id) => `/accounts/${id}`,
  },

  // Meetings
  MEETINGS: {
    BASE: "/meetings",
    BY_ID: (id) => `/meetings/${id}`,
    BY_GROUP: (groupId) => `/meetings?group=${groupId}`,
    ATTENDANCE: (id) => `/meetings/${id}/attendance`,
    MARK_ATTENDANCE: (id) => `/meetings/${id}/attendance`,
  },

  // Reports
  REPORTS: {
    BASE: "/reports",
    DASHBOARD: "/reports/dashboard",
    LOANS: "/reports/loans",
    SAVINGS: "/reports/savings",
    TRANSACTIONS: "/reports/transactions",
    MEMBERS: "/reports/members",
    GROUPS: "/reports/groups",
    EXPORT: (type) => `/reports/${type}/export`,
    RECENT_ACTIVITY: "/reports/recent-activity",
    UPCOMING_REPAYMENTS: "/reports/upcoming-repayments",
    FINANCIAL_SUMMARY: "/reports/financial-summary",
    GROUP_SAVINGS_PERFORMANCE: "/reports/group-savings-performance",
    ACTIVE_LOAN_DEFAULTERS: "/reports/active-loan-defaulters",
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    UNREAD_COUNT: "/notifications/unread-count",
  },

  // Settings
  SETTINGS: {
    BASE: "/settings",
    APP: "/settings/app",
    UPDATE_APP: "/settings/app",
    USER: "/settings/user",
    UPDATE_USER: "/settings/user",
  },

  // Chat
  CHAT: {
    BASE: "/chat",
    MESSAGES: (chatId) => `/chat/${chatId}/messages`,
    SEND_MESSAGE: (chatId) => `/chat/${chatId}/messages`,
    MARK_READ: (chatId) => `/chat/${chatId}/read`,
  },

  // Guarantors
  GUARANTORS: {
    BASE: "/guarantors",
    BY_ID: (id) => `/guarantors/${id}`,
    BY_LOAN: (loanId) => `/guarantors?loan=${loanId}`,
    APPROVE: (id) => `/guarantors/${id}/approve`,
    REJECT: (id) => `/guarantors/${id}/reject`,
  },

  // Contributions
  CONTRIBUTIONS: {
    BASE: "/contributions",
    BY_ID: (id) => `/contributions/${id}`,
    BY_GROUP: (groupId) => `/contributions?group=${groupId}`,
    BY_MEMBER: (memberId) => `/contributions?member=${memberId}`,
    SUMMARY: (groupId) =>
      `/contributions/groups/${groupId}/contributions/summary`,
    BULK_IMPORT: (groupId) =>
      `/contributions/groups/${groupId}/contributions/bulk`,
    EXPORT: (groupId, format) =>
      `/contributions/groups/${groupId}/contributions/export?format=${format}`,
    MEMBER_HISTORY: (memberId) =>
      `/contributions/members/${memberId}/contributions`,
  },

  // Repayments
  REPAYMENTS: {
    BASE: "/repayments",
    BY_ID: (id) => `/repayments/${id}`,
    BY_LOAN: (loanId) => `/repayments?loan=${loanId}`,
    SCHEDULE: (loanId) => `/repayments/${loanId}/schedule`,
    VOID: (id) => `/repayments/${id}/void`,
  },

  // Health
  HEALTH: {
    BASE: "/health",
    STATUS: "/health/status",
  },

  // Loan Assessments
  LOAN_ASSESSMENTS: {
    BASE: "/loan-assessments",
    BY_ID: (id) => `/loan-assessments/${id}`,
    STATUS: (id) => `/loan-assessments/${id}/status`,
    STATS: "/loan-assessments/stats",
    QUICK: "/loan-assessments/quick",
  },
};

// Helper function to build query parameters
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

// Helper function to build URL with query parameters
export const buildUrl = (endpoint, params = {}) => {
  const queryString = buildQueryString(params);
  return `${endpoint}${queryString}`;
};

export default ENDPOINTS;
