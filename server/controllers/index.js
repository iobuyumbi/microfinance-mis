// server/controllers/index.js

// Import all your individual controllers
const authController = require('./authController');
const userController = require('./userController');
const groupController = require('./groupController');
const loanController = require('./loanController');
const repaymentController = require('./repaymentController'); // To be reviewed
const meetingController = require('./meetingController'); // To be reviewed
const reportController = require('./reportController'); // To be reviewed
const notificationController = require('./notificationController'); // To be reviewed

// This controller now handles ALL account-related financial movements
// (deposits, withdrawals) and fetching account details/history.
// It leverages the 'Account' and 'Transaction' models directly.
const savingsController = require('./savingsController');

// This controller handles generic transaction creation, retrieval,
// and soft-deletion for auditing purposes, across all transaction types.
const transactionController = require('./transactionController');

// The following controllers are deprecated as their responsibilities are
// now covered by savingsController (for account management) and
// transactionController (for history).
// const accountController = require("./accountController");
// const accountHistoryController = require("./accountHistoryController");

// The guarantor controller needs to be reviewed as well
const guarantorController = require('./guarantorController'); // To be reviewed

// Export all active controllers as a single object
module.exports = {
  authController,
  userController,
  groupController,
  loanController,
  repaymentController,
  meetingController,
  reportController,
  notificationController,
  savingsController, // Now covers account management and movements
  transactionController, // Covers all transaction auditing
  guarantorController, // Still pending review
};
