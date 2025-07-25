// src/services/reportService.js
import api from "./api";
import { handleRequest } from "./handleRequest";

export const reportService = {
  getDashboardStats: () =>
    handleRequest(api.get("/reports/dashboard"), "Failed to fetch dashboard statistics"),

  getFinancialSummary: (params) =>
    handleRequest(api.get("/reports/financial-summary", { params }), "Failed to fetch financial summary"),

  getUpcomingRepayments: (params) =>
    handleRequest(api.get("/reports/upcoming-repayments", { params }), "Failed to fetch upcoming repayments"),

  getDefaulters: (params) =>
    handleRequest(api.get("/reports/defaulters", { params }), "Failed to fetch defaulters report"),

  getTotalLoans: (params) =>
    handleRequest(api.get("/reports/total-loans", { params }), "Failed to fetch total loan data"),

  getGroupSavings: (params) =>
    handleRequest(api.get("/reports/group-savings", { params }), "Failed to fetch group savings"),

  getLoanReports: (params) =>
    handleRequest(api.get("/loans", { params }), "Failed to fetch loan reports"),

  getLoanPortfolioHealth: () =>
    handleRequest(api.get("/reports/loan-portfolio-health"), "Failed to fetch loan portfolio health"),

  getMemberReports: (params) =>
    handleRequest(api.get("/reports/members", { params }), "Failed to fetch member reports"),

  getMemberStats: () =>
    handleRequest(api.get("/reports/member-stats"), "Failed to fetch member statistics"),

  getSavingsReports: (params) =>
    handleRequest(api.get("/savings", { params }), "Failed to fetch savings reports"),

  getSavingsStats: () =>
    handleRequest(api.get("/reports/savings-stats"), "Failed to fetch savings statistics"),

  getTransactionReports: (params) =>
    handleRequest(api.get("/transactions", { params }), "Failed to fetch transaction reports"),

  exportReport: (type, format, params) =>
    api.get(`/reports/export/${type}/${format}`, {
      params,
      responseType: "blob", // binary file download – no handleRequest
    }),
};
