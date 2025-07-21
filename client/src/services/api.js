// api.js - API service for Microfinance MIS
import axios from "axios";

// Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// --- Auth Service ---
export const authService = {
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  forgotPassword: async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  },
};

// --- User Service ---
export const userService = {
  getAll: async () => (await api.get("/users")).data,
  getById: async (id) => (await api.get(`/users/${id}`)).data,
  updateProfile: async (data) => (await api.put("/users/profile", data)).data,
  updateRoleStatus: async (id, data) =>
    (await api.put(`/users/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/users/${id}`)).data,
};

// --- Group Service ---
export const groupService = {
  create: async (data) => (await api.post("/groups", data)).data,
  getAll: async () => (await api.get("/groups")).data,
  getById: async (id) => (await api.get(`/groups/${id}`)).data,
  update: async (id, data) => (await api.put(`/groups/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/groups/${id}`)).data,
  addMember: async (id, userId) =>
    (await api.post(`/groups/${id}/members`, { userId })).data,
  removeMember: async (id, userId) =>
    (await api.delete(`/groups/${id}/members`, { data: { userId } })).data,
};

// --- Loan Service ---
export const loanService = {
  apply: async (data) => (await api.post("/loans", data)).data,
  getAll: async () => (await api.get("/loans")).data,
  getById: async (id) => (await api.get(`/loans/${id}`)).data,
  update: async (id, data) => (await api.put(`/loans/${id}`, data)).data,
  approve: async (id, data) =>
    (await api.put(`/loans/${id}/approve`, data)).data,
  delete: async (id) => (await api.delete(`/loans/${id}`)).data,
};

// --- Repayment Service ---
export const repaymentService = {
  record: async (data) => (await api.post("/repayments", data)).data,
  getAll: async () => (await api.get("/repayments")).data,
  getById: async (id) => (await api.get(`/repayments/${id}`)).data,
  getByLoan: async (loanId) =>
    (await api.get(`/repayments/loan/${loanId}`)).data,
  delete: async (id) => (await api.delete(`/repayments/${id}`)).data,
};

// --- Meeting Service ---
export const meetingService = {
  schedule: async (data) => (await api.post("/meetings", data)).data,
  getAll: async () => (await api.get("/meetings")).data,
  getById: async (id) => (await api.get(`/meetings/${id}`)).data,
  update: async (id, data) => (await api.put(`/meetings/${id}`, data)).data,
  markAttendance: async (id, userId) =>
    (await api.post(`/meetings/${id}/attendance`, { userId })).data,
  delete: async (id) => (await api.delete(`/meetings/${id}`)).data,
};

// --- Report Service ---
export const reportService = {
  upcomingRepayments: async () =>
    (await api.get("/reports/upcoming-repayments")).data,
  totalLoansDisbursed: async () => (await api.get("/reports/total-loans")).data,
  groupSavingsPerformance: async () =>
    (await api.get("/reports/group-savings")).data,
  activeLoanDefaulters: async () => (await api.get("/reports/defaulters")).data,
  financialSummary: async (params) =>
    (await api.get("/reports/financial-summary", { params })).data,
};

// --- Notification Service ---
export const notificationService = {
  create: async (data) => (await api.post("/notifications", data)).data,
  getAll: async () => (await api.get("/notifications")).data,
  getById: async (id) => (await api.get(`/notifications/${id}`)).data,
  update: async (id, data) =>
    (await api.put(`/notifications/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/notifications/${id}`)).data,
};

// --- Savings Service ---
export const savingsService = {
  create: async (data) => (await api.post("/savings", data)).data,
  getAll: async () => (await api.get("/savings")).data,
  getById: async (id) => (await api.get(`/savings/${id}`)).data,
  update: async (id, data) => (await api.put(`/savings/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/savings/${id}`)).data,
};

// --- Transaction Service ---
export const transactionService = {
  create: async (data) => (await api.post("/transactions", data)).data,
  getAll: async () => (await api.get("/transactions")).data,
  getById: async (id) => (await api.get(`/transactions/${id}`)).data,
  update: async (id, data) => (await api.put(`/transactions/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/transactions/${id}`)).data,
};

// --- Account Service ---
export const accountService = {
  create: async (data) => (await api.post("/accounts", data)).data,
  getAll: async () => (await api.get("/accounts")).data,
  getById: async (id) => (await api.get(`/accounts/${id}`)).data,
  update: async (id, data) => (await api.put(`/accounts/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/accounts/${id}`)).data,
};

// --- Account History Service ---
export const accountHistoryService = {
  create: async (data) => (await api.post("/account-history", data)).data,
  getAll: async () => (await api.get("/account-history")).data,
  getById: async (id) => (await api.get(`/account-history/${id}`)).data,
  update: async (id, data) =>
    (await api.put(`/account-history/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/account-history/${id}`)).data,
};

// --- Guarantor Service ---
export const guarantorService = {
  create: async (data) => (await api.post("/guarantors", data)).data,
  getAll: async () => (await api.get("/guarantors")).data,
  getById: async (id) => (await api.get(`/guarantors/${id}`)).data,
  update: async (id, data) => (await api.put(`/guarantors/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/guarantors/${id}`)).data,
};

export default api;
