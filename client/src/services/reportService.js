import api from "../lib/axios";

export const reportService = {
  getFinancialSummary: (params) =>
    api.get("/reports/financial-summary", { params }).then((res) => res.data),
  getUpcomingRepayments: (params) =>
    api.get("/reports/upcoming-repayments", { params }).then((res) => res.data),
  getDefaulters: (params) =>
    api.get("/reports/defaulters", { params }).then((res) => res.data),
  getTotalLoans: (params) =>
    api.get("/reports/total-loans", { params }).then((res) => res.data),
  getGroupSavings: (params) =>
    api.get("/reports/group-savings", { params }).then((res) => res.data),
};
