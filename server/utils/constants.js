// server/utils/constants.js

/**
 * Application-wide constants for server-side code
 * Aligned with client-side FinancialConstants for consistency
 */
const Constants = {
  // Currency settings
  DEFAULT_CURRENCY: 'KES', // Default currency for the application
  FALLBACK_CURRENCY: 'USD', // Fallback currency if settings are not available

  // Loan settings - aligned with client FinancialConstants
  DEFAULT_INTEREST_RATE: 10, // Default annual interest rate (10%)
  DEFAULT_LOAN_TERM: 12, // Default loan term in months
  MIN_LOAN_AMOUNT: 100, // Minimum loan amount (aligned with client)
  MAX_LOAN_AMOUNT: 1000000, // Maximum loan amount (aligned with client)
  MAX_INTEREST_RATE: 50, // Maximum interest rate (aligned with client)
  MIN_INTEREST_RATE: 0.1, // Minimum interest rate (aligned with client)
  MIN_LOAN_TERM: 1, // Minimum loan term in months (aligned with client)
  MAX_LOAN_TERM: 360, // Maximum loan term in months (aligned with client)

  // Savings settings
  DEFAULT_SAVINGS_INTEREST_RATE: 5, // Default annual interest rate for savings (5%)

  // Penalty settings - aligned with client FinancialConstants
  DEFAULT_LATE_PENALTY_RATE: 0.5, // Default late penalty rate (0.5% per day)
  MAX_DAILY_PENALTY_RATE: 5, // Maximum daily penalty rate (5% per day)

  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Financial calculation constants
  SAVINGS_INTEREST_CALCULATION_DAYS: 365,
  LOAN_INTEREST_CALCULATION_DAYS: 360,
};

module.exports = Constants;
