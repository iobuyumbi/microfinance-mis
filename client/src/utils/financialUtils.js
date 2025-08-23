/**
 * Consolidated Financial Utilities
 * Centralizes all financial calculations, formatting, and validation logic
 * Ensures consistency across the application and makes the code more DRY
 */

import { formatCurrency, formatCompactCurrency, formatPercentage } from './formatters';

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
   * Calculate loan repayment amount (flat rate)
   * @param {number} principal - Loan amount
   * @param {number} rate - Annual interest rate (as percentage)
   * @param {number} term - Loan term in months
   * @returns {number} - Monthly payment amount
   */
  calculateLoanPayment: (principal, rate, term) => {
    if (!principal || !rate || !term) return 0;
    const totalInterest = (principal * rate * term) / (100 * 12);
    const totalAmount = principal + totalInterest;
    return totalAmount / term;
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
    
    const monthlyPayment = FinancialCalculations.calculateLoanPayment(principal, rate, term);
    const schedule = [];
    let currentDate = new Date(startDate);
    let remainingBalance = principal + (principal * rate * term) / (100 * 12);

    for (let i = 0; i < term; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      remainingBalance -= monthlyPayment;
      
      schedule.push({
        paymentNumber: i + 1,
        dueDate: new Date(currentDate),
        amount: parseFloat(monthlyPayment.toFixed(2)),
        remainingBalance: Math.max(0, parseFloat(remainingBalance.toFixed(2))),
        status: 'pending'
      });
    }

    return schedule;
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
  }
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
      return { isValid: false, error: 'Amount is required' };
    }
    
    if (isNaN(amount) || amount <= 0) {
      return { isValid: false, error: 'Amount must be a positive number' };
    }
    
    if (amount < minAmount) {
      return { isValid: false, error: `Amount must be at least ${formatCurrency(minAmount)}` };
    }
    
    if (amount > maxAmount) {
      return { isValid: false, error: `Amount cannot exceed ${formatCurrency(maxAmount)}` };
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
      return { isValid: false, error: 'Interest rate is required' };
    }
    
    if (isNaN(rate) || rate < 0) {
      return { isValid: false, error: 'Interest rate must be a positive number' };
    }
    
    if (rate > maxRate) {
      return { isValid: false, error: `Interest rate cannot exceed ${maxRate}%` };
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
      return { isValid: false, error: 'Loan term is required' };
    }
    
    if (isNaN(term) || term < 1) {
      return { isValid: false, error: 'Loan term must be at least 1 month' };
    }
    
    if (term < minTerm) {
      return { isValid: false, error: `Loan term must be at least ${minTerm} months` };
    }
    
    if (term > maxTerm) {
      return { isValid: false, error: `Loan term cannot exceed ${maxTerm} months` };
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
        error: `Insufficient funds. Available: ${formatCurrency(currentBalance)}, Required: ${formatCurrency(withdrawalAmount)}`
      };
    }
    
    return { isValid: true, error: null };
  }
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
  formatAmount: (amount, currency, compact = false) => {
    if (amount === null || amount === undefined) return 'N/A';
    return compact ? formatCompactCurrency(amount, currency) : formatCurrency(amount, currency);
  },

  /**
   * Format interest rate
   * @param {number} rate - Interest rate
   * @returns {string} - Formatted rate
   */
  formatInterestRate: (rate) => {
    if (rate === null || rate === undefined) return 'N/A';
    return formatPercentage(rate, 2);
  },

  /**
   * Get status color for financial status
   * @param {string} status - Financial status
   * @returns {string} - CSS color class
   */
  getStatusColor: (status) => {
    const statusColors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-gray-600 bg-gray-100',
      overdue: 'text-red-600 bg-red-100',
      pending: 'text-yellow-600 bg-yellow-100',
      completed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      default: 'text-gray-600 bg-gray-100'
    };
    
    return statusColors[status] || statusColors.default;
  },

  /**
   * Get icon for transaction type
   * @param {string} type - Transaction type
   * @returns {string} - Icon name
   */
  getTransactionIcon: (type) => {
    const icons = {
      savings_contribution: 'Plus',
      savings_withdrawal: 'Minus',
      loan_disbursement: 'ArrowUp',
      loan_repayment: 'ArrowDown',
      interest_earned: 'TrendingUp',
      interest_charged: 'TrendingDown',
      penalty_incurred: 'AlertTriangle',
      penalty_paid: 'CheckCircle',
      fee_incurred: 'DollarSign',
      fee_paid: 'CheckCircle',
      transfer_in: 'ArrowRight',
      transfer_out: 'ArrowLeft',
      refund: 'RotateCcw',
      adjustment_credit: 'Plus',
      adjustment_debit: 'Minus'
    };
    
    return icons[type] || 'DollarSign';
  }
};

/**
 * Financial constants
 */
export const FinancialConstants = {
  DEFAULT_CURRENCY: 'USD',
  MAX_LOAN_AMOUNT: 1000000,
  MIN_LOAN_AMOUNT: 100,
  MAX_INTEREST_RATE: 50,
  MIN_INTEREST_RATE: 0.1,
  MAX_LOAN_TERM: 360, // 30 years
  MIN_LOAN_TERM: 1, // 1 month
  DEFAULT_LATE_PENALTY_RATE: 0.5, // 0.5% per day
  MAX_DAILY_PENALTY_RATE: 5, // 5% per day
  SAVINGS_INTEREST_CALCULATION_DAYS: 365,
  LOAN_INTEREST_CALCULATION_DAYS: 360
};

export default {
  FinancialCalculations,
  FinancialValidation,
  FinancialDisplay,
  FinancialConstants
}; 