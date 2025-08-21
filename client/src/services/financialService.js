// src/services/financialService.js
import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const financialService = {
  // Dashboard and Overview
  getDashboardStats: (params = {}) =>
    api.get(ENDPOINTS.REPORTS.DASHBOARD, { params }),

  getFinancialSummary: (params = {}) =>
    api.get(ENDPOINTS.REPORTS.FINANCIAL_SUMMARY, { params }),

  // Account Management
  getAccounts: (params = {}) => api.get(ENDPOINTS.ACCOUNTS.BASE, { params }),
  getAccountBalance: (accountId) =>
    api.get(ENDPOINTS.ACCOUNTS.BY_ID(accountId)),

  getAccountsByOwner: (ownerId, ownerModel) =>
    api.get(ENDPOINTS.ACCOUNTS.BY_OWNER(ownerId, ownerModel)),

  // Transaction Management
  createTransaction: (transactionData) =>
    api.post(ENDPOINTS.TRANSACTIONS.BASE, transactionData),

  getTransactions: (params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BASE, { params }),

  getTransactionsByType: (type, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BY_TYPE(type), { params }),

  getTransactionsByDateRange: (startDate, endDate, params = {}) =>
    api.get(ENDPOINTS.TRANSACTIONS.BY_DATE_RANGE(startDate, endDate), {
      params,
    }),

  // Loan Management
  getLoanPortfolio: (params = {}) => api.get(ENDPOINTS.LOANS.BASE, { params }),

  getLoanStats: () => api.get(ENDPOINTS.LOANS.STATS),

  getUpcomingRepayments: (params = {}) =>
    api.get(ENDPOINTS.REPORTS.UPCOMING_REPAYMENTS, { params }),

  getLoanDefaulters: () => api.get(ENDPOINTS.REPORTS.ACTIVE_LOAN_DEFAULTERS),

  // Savings Management
  getSavingsStats: () => api.get(ENDPOINTS.SAVINGS.STATS),

  getSavingsTransactions: (accountId, params = {}) =>
    api.get(ENDPOINTS.SAVINGS.TRANSACTIONS(accountId), { params }),

  // Contribution Management
  getContributionSummary: (groupId) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.SUMMARY(groupId)),

  getMemberContributions: (memberId, params = {}) =>
    api.get(ENDPOINTS.CONTRIBUTIONS.BY_MEMBER(memberId), { params }),

  // Reports and Analytics
  getGroupPerformance: () =>
    api.get(ENDPOINTS.REPORTS.GROUP_SAVINGS_PERFORMANCE),

  getRecentActivity: () => api.get(ENDPOINTS.REPORTS.RECENT_ACTIVITY),

  // Financial Calculations
  calculateLoanSchedule: (amount, interestRate, term) => {
    const totalInterest = amount * (interestRate / 100);
    const totalAmount = amount + totalInterest;
    const monthlyPayment = totalAmount / term;

    const schedule = [];
    let currentDate = new Date();

    for (let i = 0; i < term; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        dueDate: new Date(currentDate),
        amount: parseFloat(monthlyPayment.toFixed(2)),
        status: "pending",
      });
    }

    return schedule;
  },

  calculateSavingsInterest: (principal, interestRate, days) => {
    return (principal * interestRate * days) / (100 * 365);
  },

  // Utility Functions
  formatCurrency: (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  formatPercentage: (value) => {
    return `${(value * 100).toFixed(2)}%`;
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString();
  },

  // Financial Health Indicators
  calculateLoanToValueRatio: (loanAmount, collateralValue) => {
    if (!collateralValue || collateralValue === 0) return null;
    return loanAmount / collateralValue;
  },

  calculateDebtToIncomeRatio: (monthlyDebt, monthlyIncome) => {
    if (!monthlyIncome || monthlyIncome === 0) return null;
    return monthlyDebt / monthlyIncome;
  },

  calculateSavingsRate: (monthlySavings, monthlyIncome) => {
    if (!monthlyIncome || monthlyIncome === 0) return null;
    return monthlySavings / monthlyIncome;
  },

  // Risk Assessment
  assessLoanRisk: (loanData) => {
    const {
      borrowerCreditScore,
      loanAmount,
      loanTerm,
      collateralValue,
      monthlyIncome,
      existingDebt,
    } = loanData;

    let riskScore = 0;
    let riskFactors = [];

    // Credit score assessment
    if (borrowerCreditScore < 600) {
      riskScore += 30;
      riskFactors.push("Low credit score");
    } else if (borrowerCreditScore < 700) {
      riskScore += 15;
      riskFactors.push("Below average credit score");
    }

    // Loan amount assessment
    const loanToIncomeRatio = loanAmount / (monthlyIncome * 12);
    if (loanToIncomeRatio > 0.5) {
      riskScore += 25;
      riskFactors.push("High loan-to-income ratio");
    } else if (loanToIncomeRatio > 0.3) {
      riskScore += 10;
      riskFactors.push("Moderate loan-to-income ratio");
    }

    // Debt-to-income assessment
    const debtToIncomeRatio = existingDebt / monthlyIncome;
    if (debtToIncomeRatio > 0.4) {
      riskScore += 20;
      riskFactors.push("High debt-to-income ratio");
    } else if (debtToIncomeRatio > 0.2) {
      riskScore += 10;
      riskFactors.push("Moderate debt-to-income ratio");
    }

    // Collateral assessment
    if (collateralValue && loanAmount > collateralValue * 0.8) {
      riskScore += 15;
      riskFactors.push("Low collateral coverage");
    }

    // Term assessment
    if (loanTerm > 36) {
      riskScore += 10;
      riskFactors.push("Long loan term");
    }

    // Risk level determination
    let riskLevel = "low";
    if (riskScore >= 60) {
      riskLevel = "high";
    } else if (riskScore >= 30) {
      riskLevel = "medium";
    }

    return {
      riskScore,
      riskLevel,
      riskFactors,
      loanToIncomeRatio,
      debtToIncomeRatio,
    };
  },

  // Portfolio Analysis
  analyzePortfolio: (loans) => {
    const totalLoans = loans.length;
    const totalAmount = loans.reduce(
      (sum, loan) => sum + (loan.amountApproved || 0),
      0
    );
    const activeLoans = loans.filter((loan) =>
      ["approved", "disbursed"].includes(loan.status)
    );
    const overdueLoans = loans.filter((loan) => loan.status === "overdue");
    const completedLoans = loans.filter((loan) => loan.status === "completed");

    const averageLoanAmount = totalAmount / totalLoans || 0;
    const overdueRate = (overdueLoans.length / activeLoans.length) * 100 || 0;
    const completionRate = (completedLoans.length / totalLoans) * 100 || 0;

    return {
      totalLoans,
      totalAmount,
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      completedLoans: completedLoans.length,
      averageLoanAmount,
      overdueRate,
      completionRate,
    };
  },
};
