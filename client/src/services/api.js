// api.js - API service for Microfinance MIS
import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API services
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// User API services
export const userService = {
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },
  updateUserRoleStatus: async (id, updates) => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Group API services
export const groupService = {
  createGroup: async (groupData) => {
    const response = await api.post("/groups", groupData);
    return response.data;
  },
  getAllGroups: async (page = 1, limit = 10) => {
    const response = await api.get(`/groups?page=${page}&limit=${limit}`);
    return response.data;
  },
  getGroupById: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },
  updateGroup: async (id, groupData) => {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data;
  },
  deleteGroup: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },
  addMember: async (groupId, memberId) => {
    const response = await api.post(`/groups/${groupId}/members`, { memberId });
    return response.data;
  },
  removeMember: async (groupId, memberId) => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },
};

// Loan API services
export const loanService = {
  applyForLoan: async (loanData) => {
    const response = await api.post("/loans", loanData);
    return response.data;
  },
  getAllLoans: async (page = 1, limit = 10) => {
    const response = await api.get(`/loans?page=${page}&limit=${limit}`);
    return response.data;
  },
  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },
  approveLoan: async (id, approvalData) => {
    const response = await api.put(`/loans/${id}/approve`, approvalData);
    return response.data;
  },
  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },
  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },
};

// Meeting API services
export const meetingService = {
  scheduleMeeting: async (meetingData) => {
    const response = await api.post("/meetings", meetingData);
    return response.data;
  },
  getAllMeetings: async (page = 1, limit = 10) => {
    const response = await api.get(`/meetings?page=${page}&limit=${limit}`);
    return response.data;
  },
  getMeetingById: async (id) => {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  },
  updateMeeting: async (id, meetingData) => {
    const response = await api.put(`/meetings/${id}`, meetingData);
    return response.data;
  },
  markAttendance: async (id, attendanceData) => {
    const response = await api.post(
      `/meetings/${id}/attendance`,
      attendanceData
    );
    return response.data;
  },
  deleteMeeting: async (id) => {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  },
};

// Report API services
export const reportService = {
  getUpcomingRepayments: async () => {
    const response = await api.get("/reports/upcoming-repayments");
    return response.data;
  },
  getTotalLoansDisbursed: async () => {
    const response = await api.get("/reports/total-loans-disbursed");
    return response.data;
  },
  getGroupSavingsPerformance: async () => {
    const response = await api.get("/reports/group-savings-performance");
    return response.data;
  },
  getActiveLoanDefaulters: async () => {
    const response = await api.get("/reports/active-loan-defaulters");
    return response.data;
  },
  getFinancialSummary: async () => {
    const response = await api.get("/reports/financial-summary");
    return response.data;
  },
};

// Export other services (savings, transactions, accounts, etc.)
export const savingsService = {
  createSavings: async (savingsData) => {
    const response = await api.post("/savings", savingsData);
    return response.data;
  },
  getAllSavings: async (page = 1, limit = 10) => {
    const response = await api.get(`/savings?page=${page}&limit=${limit}`);
    return response.data;
  },
  getSavingsById: async (id) => {
    const response = await api.get(`/savings/${id}`);
    return response.data;
  },
};

export const transactionService = {
  createTransaction: async (transactionData) => {
    const response = await api.post("/transactions", transactionData);
    return response.data;
  },
  getAllTransactions: async (page = 1, limit = 10) => {
    const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export const accountService = {
  createAccount: async (accountData) => {
    const response = await api.post("/accounts", accountData);
    return response.data;
  },
  getAllAccounts: async (page = 1, limit = 10) => {
    const response = await api.get(`/accounts?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default api;
