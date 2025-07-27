// src/services/reportService.js
import api from "./api"; // Assuming 'api' is your configured Axios instance
import { handleRequest } from "./handleRequest"; // Assuming this path is correct

export const reportService = {
  getDashboardStats: (
    params // Added params here, as it's common for stats endpoints
  ) =>
    handleRequest(
      () => api.get("/reports/dashboard", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch dashboard statistics"
    ),

  getFinancialSummary: (params) =>
    handleRequest(
      () => api.get("/reports/financial-summary", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch financial summary"
    ),

  getUpcomingRepayments: (params) =>
    handleRequest(
      () => api.get("/reports/upcoming-repayments", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch upcoming repayments"
    ),

  getDefaulters: (params) =>
    handleRequest(
      () => api.get("/reports/defaulters", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch defaulters report"
    ),

  getTotalLoans: (params) =>
    handleRequest(
      () => api.get("/reports/total-loans", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch total loan data"
    ),

  getGroupSavings: (params) =>
    handleRequest(
      () => api.get("/reports/group-savings", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch group savings"
    ),

  getLoanReports: (params) =>
    handleRequest(
      () => api.get("/loans", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch loan reports"
    ),

  getLoanPortfolioHealth: () =>
    handleRequest(
      () => api.get("/reports/loan-portfolio-health"), // Correct: Wrap in an arrow function
      "Failed to fetch loan portfolio health"
    ),

  getMemberReports: (params) =>
    handleRequest(
      () => api.get("/reports/members", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch member reports"
    ),

  getMemberStats: () =>
    handleRequest(
      () => api.get("/reports/member-stats"), // Correct: Wrap in an arrow function
      "Failed to fetch member statistics"
    ),

  getSavingsReports: (params) =>
    handleRequest(
      () => api.get("/savings", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch savings reports"
    ),

  getSavingsStats: () =>
    handleRequest(
      () => api.get("/reports/savings-stats"), // Correct: Wrap in an arrow function
      "Failed to fetch savings statistics"
    ),

  getTransactionReports: (params) =>
    handleRequest(
      () => api.get("/transactions", { params }), // Correct: Wrap in an arrow function
      "Failed to fetch transaction reports"
    ),

  exportReport: (type, format, params) =>
    // This one is correct as it does not use handleRequest and directly returns the axios promise
    api.get(`/reports/export/${type}/${format}`, {
      params,
      responseType: "blob", // binary file download – no handleRequest
    }),
};
