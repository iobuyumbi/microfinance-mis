/**
 * Consolidated Financial Utilities
 * Centralizes all financial calculations, formatting, and validation logic
 * Ensures consistency across the application and makes the code more DRY
 */

import {
  formatCurrency,
  formatCompactCurrency,
  formatPercentage,
} from "./formatters";

/**
 * Financial calculation utilities
 */
export const FinancialCalculations = {
  /**
   * Calculate simple interest
   * @param {number} principal - Principal amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} time - Time period in years
   * @returns {number} - Interest amount
   */
  calculateSimpleInterest: (principal, rate, time) => {
    if (!principal || !rate || !time) return 0;
    return (principal * rate * time) / 100;
  },

  /**
   * Calculate compound interest
   * @param {number} principal - Principal amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} time - Time period in years
   * @param {number} frequency - Compounding frequency per year (default: 12 for monthly)
   * @returns {number} - Interest amount
   */
  calculateCompoundInterest: (principal, rate, time, frequency = 12) => {
    if (!principal || !rate || !time) return 0;
    const r = rate / 100;
    const n = frequency;
    const t = time;
    return principal * Math.pow(1 + r / n, n * t) - principal;
  },

  /**
   * Calculate loan repayment amount using amortization formula
   * @param {number} principal - Loan amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} term - Loan term in months
   * @returns {number} - Monthly payment amount
   */
  calculateLoanPayment: (principal, rate, term) => {
    if (!principal || !rate || !term || term <= 0) return 0;

    const monthlyRate = rate / 12 / 100;

    if (monthlyRate === 0) {
      return principal / term;
    }

    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
      (Math.pow(1 + monthlyRate, term) - 1);

    return Math.round(payment * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Calculate total interest over loan term
   * @param {number} principal - Loan amount
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} months - Loan term in months
   * @returns {number} - Total interest amount
   */
  calculateTotalInterest: (principal, monthlyPayment, months) => {
    if (!principal || !monthlyPayment || !months) return 0;
    const totalPayments = monthlyPayment * months;
    return Math.round((totalPayments - principal) * 100) / 100;
  },

  /**
   * Calculate remaining balance after n payments
   * @param {number} principal - Loan amount
   * @param {number} monthlyPayment - Monthly payment amount
   * @param {number} monthsPaid - Number of months paid
   * @param {number} annualRate - Annual interest rate
   * @returns {number} - Remaining balance
   */
  calculateRemainingBalance: (
    principal,
    monthlyPayment,
    monthsPaid,
    annualRate
  ) => {
    if (!principal || !monthlyPayment || !monthsPaid || !annualRate) return 0;

    const monthlyRate = annualRate / 12 / 100;

    if (monthlyRate === 0) {
      return Math.max(0, principal - monthlyPayment * monthsPaid);
    }

    const remainingBalance =
      principal * Math.pow(1 + monthlyRate, monthsPaid) -
      (monthlyPayment * (Math.pow(1 + monthlyRate, monthsPaid) - 1)) /
        monthlyRate;

    return Math.max(0, Math.round(remainingBalance * 100) / 100);
  },

  /**
   * Calculate loan repayment schedule
   * @param {number} principal - Loan amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} term - Loan term in months
   * @param {Date} startDate - Loan start date
   * @returns {Array} - Array of payment schedule objects
   */
  calculateLoanSchedule: (principal, rate, term, startDate = new Date()) => {
    if (!principal || !rate || !term) return [];

    const monthlyPayment = FinancialCalculations.calculateLoanPayment(
      principal,
      rate,
      term
    );
    const schedule = [];
    let currentDate = new Date(startDate);
    let remainingBalance = principal;

    for (let i = 0; i < term; i++) {
      const monthlyInterest = FinancialCalculations.calculateMonthlyInterest(
        remainingBalance,
        rate
      );
      const monthlyPrincipal = monthlyPayment - monthlyInterest;

      remainingBalance = Math.max(0, remainingBalance - monthlyPrincipal);

      schedule.push({
        paymentNumber: i + 1,
        dueDate: new Date(currentDate),
        amount: parseFloat(monthlyPayment.toFixed(2)),
        principal: parseFloat(monthlyPrincipal.toFixed(2)),
        interest: parseFloat(monthlyInterest.toFixed(2)),
        remainingBalance: parseFloat(remainingBalance.toFixed(2)),
        status: "pending",
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return schedule;
  },

  /**
   * Calculate interest paid in a specific month
   * @param {number} remainingBalance - Current remaining balance
   * @param {number} annualRate - Annual interest rate
   * @returns {number} - Monthly interest amount
   */
  calculateMonthlyInterest: (remainingBalance, annualRate) => {
    if (!remainingBalance || !annualRate) return 0;
    const monthlyRate = annualRate / 12 / 100;
    return Math.round(remainingBalance * monthlyRate * 100) / 100;
  },

  /**
   * Calculate savings interest earned
   * @param {number} principal - Principal amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} days - Number of days
   * @returns {number} - Interest amount
   */
  calculateSavingsInterest: (principal, rate, days) => {
    if (!principal || !rate || !days) return 0;
    return (principal * rate * days) / (100 * 365);
  },

  /**
   * Calculate late payment penalty
   * @param {number} amount - Overdue amount
   * @param {number} daysLate - Number of days late
   * @param {number} penaltyRate - Daily penalty rate (as percentage)
   * @returns {number} - Penalty amount
   */
  calculateLatePenalty: (amount, daysLate, penaltyRate = 0.5) => {
    if (!amount || !daysLate || daysLate <= 0) return 0;
    return (amount * penaltyRate * daysLate) / 100;
  },

  /**
   * Calculate debt-to-income ratio
   * @param {number} monthlyDebtPayments - Monthly debt payments
   * @param {number} monthlyIncome - Monthly income
   * @returns {number} - DTI ratio as percentage
   */
  calculateDTI: (monthlyDebtPayments, monthlyIncome) => {
    if (!monthlyDebtPayments || !monthlyIncome || monthlyIncome === 0) return 0;
    return Math.round((monthlyDebtPayments / monthlyIncome) * 100 * 100) / 100;
  },

  /**
   * Calculate loan-to-value ratio
   * @param {number} loanAmount - Loan amount
   * @param {number} propertyValue - Property/collateral value
   * @returns {number} - LTV ratio as percentage
   */
  calculateLTV: (loanAmount, propertyValue) => {
    if (!loanAmount || !propertyValue || propertyValue === 0) return 0;
    return Math.round((loanAmount / propertyValue) * 100 * 100) / 100;
  },
};

/**
 * Financial validation utilities
 */
export const FinancialValidation = {
  /**
   * Validate amount is positive and within limits
   * @param {number} amount - Amount to validate
   * @param {number} minAmount - Minimum allowed amount
   * @param {number} maxAmount - Maximum allowed amount
   * @returns {Object} - Validation result
   */
  validateAmount: (amount, minAmount = 0, maxAmount = 1000000000) => {
    if (amount === null || amount === undefined) {
      return { isValid: false, error: "Amount is required" };
    }

    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: "Amount must be a positive number" };
    }

    if (amount < minAmount) {
      return {
        isValid: false,
        error: `Amount must be at least ${formatCurrency(minAmount)}`,
      };
    }

    if (amount > maxAmount) {
      return {
        isValid: false,
        error: `Amount cannot exceed ${formatCurrency(maxAmount)}`,
      };
    }

    return { isValid: true, error: null };
  },

  /**
   * Validate interest rate
   * @param {number} rate - Interest rate to validate
   * @param {number} maxRate - Maximum allowed rate
   * @returns {Object} - Validation result
   */
  validateInterestRate: (rate, maxRate = 100) => {
    if (rate === null || rate === undefined) {
      return { isValid: false, error: "Interest rate is required" };
    }

    if (isNaN(rate) || rate < 0) {
      return {
        isValid: false,
        error: "Interest rate must be a positive number",
      };
    }

    if (rate > maxRate) {
      return {
        isValid: false,
        error: `Interest rate cannot exceed ${maxRate}%`,
      };
    }

    return { isValid: true, error: null };
  },

  /**
   * Validate loan term
   * @param {number} term - Loan term in months
   * @param {number} minTerm - Minimum term in months
   * @param {number} maxTerm - Maximum term in months
   * @returns {Object} - Validation result
   */
  validateLoanTerm: (term, minTerm = 1, maxTerm = 360) => {
    if (term === null || term === undefined) {
      return { isValid: false, error: "Loan term is required" };
    }

    if (isNaN(term) || term < 1) {
      return { isValid: false, error: "Loan term must be at least 1 month" };
    }

    if (term < minTerm) {
      return {
        isValid: false,
        error: `Loan term must be at least ${minTerm} months`,
      };
    }

    if (term > maxTerm) {
      return {
        isValid: false,
        error: `Loan term cannot exceed ${maxTerm} months`,
      };
    }

    return { isValid: true, error: null };
  },

  /**
   * Validate account balance for withdrawal
   * @param {number} currentBalance - Current account balance
   * @param {number} withdrawalAmount - Amount to withdraw
   * @returns {Object} - Validation result
   */
  validateWithdrawal: (currentBalance, withdrawalAmount) => {
    if (currentBalance < withdrawalAmount) {
      return {
        isValid: false,
        error: `Insufficient funds. Available: ${formatCurrency(
          currentBalance
        )}, Required: ${formatCurrency(withdrawalAmount)}`,
      };
    }

    return { isValid: true, error: null };
  },
};

/**
 * Financial display utilities
 */
export const FinancialDisplay = {
  /**
   * Format financial amount with appropriate precision
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @param {boolean} compact - Whether to use compact format
   * @returns {string} - Formatted amount
   */
  formatAmount: (amount, currency = null, compact = false) => {
    if (amount === null || amount === undefined) return "N/A";
    return compact
      ? formatCompactCurrency(amount, currency)
      : formatCurrency(amount, currency);
  },

  /**
   * Format interest rate
   * @param {number} rate - Interest rate
   * @returns {string} - Formatted rate
   */
  formatInterestRate: (rate) => {
    if (rate === null || rate === undefined) return "N/A";
    return formatPercentage(rate, 2);
  },

  /**
   * Get status color for financial status that works in both light and dark modes
   * @param {string} status - Financial status
   * @returns {string} - CSS color class
   */
  getStatusColor: (status) => {
    const statusColors = {
      active:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      inactive: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
      overdue: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      pending:
        "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
      completed:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      cancelled: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      defaulted: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
      default: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
    };

    return statusColors[status?.toLowerCase()] || statusColors.default;
  },

  /**
   * Get icon for transaction type
   * @param {string} type - Transaction type
   * @returns {string} - Icon name
   */
  getTransactionIcon: (type) => {
    const icons = {
      savings_contribution: "Plus",
      savings_withdrawal: "Minus",
      loan_disbursement: "ArrowUp",
      loan_repayment: "ArrowDown",
      interest_earned: "TrendingUp",
      interest_charged: "TrendingDown",
      penalty_incurred: "AlertTriangle",
      penalty_paid: "CheckCircle",
      fee_incurred: "DollarSign",
      fee_paid: "CheckCircle",
      transfer_in: "ArrowRight",
      transfer_out: "ArrowLeft",
      refund: "RotateCcw",
      adjustment_credit: "Plus",
      adjustment_debit: "Minus",
    };

    return icons[type] || "DollarSign";
  },

  /**
   * Get transaction type color that works in both light and dark modes
   * @param {string} type - Transaction type
   * @returns {string} - Tailwind CSS classes for the transaction type
   */
  getTransactionTypeColor: (type) => {
    const colors = {
      savings_contribution:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      savings_withdrawal:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      loan_disbursement:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      loan_repayment:
        "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300",
      interest_earned:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      interest_charged:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
      penalty_incurred:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      penalty_paid:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      fee_incurred:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      fee_paid:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      transfer_in:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      transfer_out:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
      refund:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      adjustment:
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
      adjustment_credit:
        "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      adjustment_debit:
        "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
    return (
      colors[type] ||
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
    );
  },

  /**
   * Get amount color based on transaction type that works in both light and dark modes
   * @param {string} type - Transaction type
   * @returns {string} - Tailwind CSS classes for the amount color
   */
  getAmountColor: (type) => {
    const creditTypes = [
      "savings_contribution",
      "loan_repayment",
      "interest_earned",
      "refund",
      "transfer_in",
      "adjustment_credit",
      "penalty_paid",
      "fee_paid",
    ];

    const debitTypes = [
      "savings_withdrawal",
      "loan_disbursement",
      "interest_charged",
      "penalty_incurred",
      "fee_incurred",
      "transfer_out",
      "adjustment_debit",
    ];

    if (creditTypes.includes(type)) {
      return "text-green-600 dark:text-green-400";
    } else if (debitTypes.includes(type)) {
      return "text-red-600 dark:text-red-400";
    } else {
      return "text-gray-600 dark:text-gray-400";
    }
  },
};

/**
 * Financial constants
 */
export const FinancialConstants = {
  DEFAULT_CURRENCY: "KES",
  MAX_LOAN_AMOUNT: 1000000,
  MIN_LOAN_AMOUNT: 100,
  MAX_INTEREST_RATE: 50,
  MIN_INTEREST_RATE: 0.1,
  MAX_LOAN_TERM: 360, // 30 years
  MIN_LOAN_TERM: 1, // 1 month
  DEFAULT_LATE_PENALTY_RATE: 0.5, // 0.5% per day
  MAX_DAILY_PENALTY_RATE: 5, // 5% per day
  SAVINGS_INTEREST_CALCULATION_DAYS: 365,
  LOAN_INTEREST_CALCULATION_DAYS: 360,
};

export default {
  FinancialCalculations,
  FinancialValidation,
  FinancialDisplay,
  FinancialConstants,
};
