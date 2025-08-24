// server/utils/constants.js

/**
 * Application-wide constants for server-side code
 */
const Constants = {
  // Currency settings
  DEFAULT_CURRENCY: 'KES', // Default currency for the application
  FALLBACK_CURRENCY: 'USD', // Fallback currency if settings are not available
  
  // Loan settings
  DEFAULT_INTEREST_RATE: 15, // Default annual interest rate (15%)
  DEFAULT_LOAN_TERM: 12, // Default loan term in months
  MIN_LOAN_AMOUNT: 500, // Minimum loan amount
  MAX_LOAN_AMOUNT: 1000000, // Maximum loan amount
  
  // Savings settings
  DEFAULT_SAVINGS_INTEREST_RATE: 5, // Default annual interest rate for savings (5%)
  
  // Penalty settings
  DEFAULT_LATE_PENALTY_RATE: 0.5, // Default late penalty rate (0.5% per day)
  
  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

module.exports = Constants;