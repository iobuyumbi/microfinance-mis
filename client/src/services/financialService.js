/**
 * Centralized Financial Service
 * Provides consistent financial operations and calculations
 * Ensures reliability and maintainability across the application
 */

import { api } from "./api/client";
import {
  FinancialCalculations,
  FinancialValidation,
  FinancialDisplay,
  FinancialConstants,
} from "../utils/financialUtils";

class FinancialService {
  /**
   * Get financial dashboard data
   * @param {string} userId - User ID
   * @param {string} groupId - Group ID (optional)
   * @returns {Promise<Object>} - Dashboard data
   */
  static async getDashboardData(userId, groupId = null) {
    try {
      const params = { userId };
      if (groupId) params.groupId = groupId;

      const response = await api.get("/financial/dashboard", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }

  /**
   * Process loan application
   * @param {Object} loanData - Loan application data
   * @returns {Promise<Object>} - Loan application result
   */
  static async processLoanApplication(loanData) {
    try {
      // Validate loan data
      const validation = this.validateLoanData(loanData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Calculate loan details
      const loanDetails = this.calculateLoanDetails(loanData);

      // Submit application
      const response = await api.post("/loans", {
        ...loanData,
        ...loanDetails,
      });

      return response.data;
    } catch (error) {
      console.error("Error processing loan application:", error);
      throw new Error(
        error.response?.data?.message || "Failed to process loan application"
      );
    }
  }

  /**
   * Process loan repayment
   * @param {Object} repaymentData - Repayment data
   * @returns {Promise<Object>} - Repayment result
   */
  static async processLoanRepayment(repaymentData) {
    try {
      // Validate repayment data
      const validation = this.validateRepaymentData(repaymentData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const response = await api.post("/repayments", repaymentData);
      return response.data;
    } catch (error) {
      console.error("Error processing loan repayment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to process loan repayment"
      );
    }
  }

  /**
   * Process savings contribution
   * @param {Object} contributionData - Contribution data
   * @returns {Promise<Object>} - Contribution result
   */
  static async processSavingsContribution(contributionData) {
    try {
      // Validate contribution data
      const validation = this.validateContributionData(contributionData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const response = await api.post(
        "/savings/contributions",
        contributionData
      );
      return response.data;
    } catch (error) {
      console.error("Error processing savings contribution:", error);
      throw new Error(
        error.response?.data?.message ||
          "Failed to process savings contribution"
      );
    }
  }

  /**
   * Process savings withdrawal
   * @param {Object} withdrawalData - Withdrawal data
   * @returns {Promise<Object>} - Withdrawal result
   */
  static async processSavingsWithdrawal(withdrawalData) {
    try {
      // Validate withdrawal data
      const validation = this.validateWithdrawalData(withdrawalData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const response = await api.post("/savings/withdrawals", withdrawalData);
      return response.data;
    } catch (error) {
      console.error("Error processing savings withdrawal:", error);
      throw new Error(
        error.response?.data?.message || "Failed to process savings withdrawal"
      );
    }
  }

  /**
   * Get transaction history
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} - Transaction history
   */
  static async getTransactionHistory(filters = {}) {
    try {
      const response = await api.get("/transactions", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw new Error("Failed to fetch transaction history");
    }
  }

  /**
   * Get financial reports
   * @param {Object} reportParams - Report parameters
   * @returns {Promise<Object>} - Financial reports
   */
  static async getFinancialReports(reportParams = {}) {
    try {
      const response = await api.get("/reports/financial", {
        params: reportParams,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching financial reports:", error);
      throw new Error("Failed to fetch financial reports");
    }
  }

  /**
   * Calculate loan details
   * @param {Object} loanData - Loan data
   * @returns {Object} - Calculated loan details
   */
  static calculateLoanDetails(loanData) {
    const { amountRequested, interestRate, loanTerm } = loanData;

    // Calculate total interest
    const totalInterest = FinancialCalculations.calculateSimpleInterest(
      amountRequested,
      interestRate,
      loanTerm / 12
    );

    // Calculate total amount
    const totalAmount = amountRequested + totalInterest;

    // Calculate monthly payment
    const monthlyPayment = FinancialCalculations.calculateLoanPayment(
      amountRequested,
      interestRate,
      loanTerm
    );

    // Generate repayment schedule
    const repaymentSchedule = FinancialCalculations.calculateLoanSchedule(
      amountRequested,
      interestRate,
      loanTerm,
      new Date()
    );

    return {
      totalInterest,
      totalAmount,
      monthlyPayment,
      repaymentSchedule,
    };
  }

  /**
   * Validate loan data
   * @param {Object} loanData - Loan data to validate
   * @returns {Object} - Validation result
   */
  static validateLoanData(loanData) {
    const { amountRequested, interestRate, loanTerm } = loanData;

    // Validate amount
    const amountValidation = FinancialValidation.validateAmount(
      amountRequested,
      FinancialConstants.MIN_LOAN_AMOUNT,
      FinancialConstants.MAX_LOAN_AMOUNT
    );
    if (!amountValidation.isValid) {
      return amountValidation;
    }

    // Validate interest rate
    const rateValidation = FinancialValidation.validateInterestRate(
      interestRate,
      FinancialConstants.MAX_INTEREST_RATE
    );
    if (!rateValidation.isValid) {
      return rateValidation;
    }

    // Validate loan term
    const termValidation = FinancialValidation.validateLoanTerm(
      loanTerm,
      FinancialConstants.MIN_LOAN_TERM,
      FinancialConstants.MAX_LOAN_TERM
    );
    if (!termValidation.isValid) {
      return termValidation;
    }

    return { isValid: true };
  }

  /**
   * Validate repayment data
   * @param {Object} repaymentData - Repayment data to validate
   * @returns {Object} - Validation result
   */
  static validateRepaymentData(repaymentData) {
    const { amount, loanId } = repaymentData;

    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: "Repayment amount must be greater than 0",
      };
    }

    if (!loanId) {
      return { isValid: false, error: "Loan ID is required" };
    }

    return { isValid: true };
  }

  /**
   * Validate contribution data
   * @param {Object} contributionData - Contribution data to validate
   * @returns {Object} - Validation result
   */
  static validateContributionData(contributionData) {
    const { amount, accountId } = contributionData;

    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: "Contribution amount must be greater than 0",
      };
    }

    if (!accountId) {
      return { isValid: false, error: "Account ID is required" };
    }

    return { isValid: true };
  }

  /**
   * Validate withdrawal data
   * @param {Object} withdrawalData - Withdrawal data to validate
   * @returns {Object} - Validation result
   */
  static validateWithdrawalData(withdrawalData) {
    const { amount, accountId, currentBalance } = withdrawalData;

    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: "Withdrawal amount must be greater than 0",
      };
    }

    if (!accountId) {
      return { isValid: false, error: "Account ID is required" };
    }

    // Check if sufficient funds are available
    if (currentBalance && amount > currentBalance) {
      return { isValid: false, error: "Insufficient funds for withdrawal" };
    }

    return { isValid: true };
  }

  /**
   * Format financial data for display
   * @param {Object} data - Financial data to format
   * @param {string} currency - Currency code
   * @returns {Object} - Formatted data
   */
  static formatFinancialData(data, currency = "KES") {
    return FinancialDisplay.formatAmount(data, currency);
  }

  /**
   * Get transaction type information
   * @param {string} type - Transaction type
   * @returns {Object} - Transaction type information
   */
  static getTransactionTypeInfo(type) {
    return {
      label: FinancialDisplay.getTransactionTypeLabel(type),
      icon: FinancialDisplay.getTransactionIcon(type),
      color: FinancialDisplay.getTransactionTypeColor(type),
      amountColor: FinancialDisplay.getAmountColor(type),
    };
  }

  /**
   * Calculate account summary
   * @param {Array} transactions - Array of transactions
   * @returns {Object} - Account summary
   */
  static calculateAccountSummary(transactions) {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalCredits: 0,
        totalDebits: 0,
        netBalance: 0,
        transactionCount: 0,
      };
    }

    const summary = transactions.reduce(
      (acc, transaction) => {
        const { type, amount } = transaction;

        if (FinancialDisplay.isCreditType(type)) {
          acc.totalCredits += amount;
        } else if (FinancialDisplay.isDebitType(type)) {
          acc.totalDebits += amount;
        }

        acc.transactionCount += 1;
        return acc;
      },
      {
        totalCredits: 0,
        totalDebits: 0,
        netBalance: 0,
        transactionCount: 0,
      }
    );

    summary.netBalance = summary.totalCredits - summary.totalDebits;

    return summary;
  }
}

export default FinancialService;
