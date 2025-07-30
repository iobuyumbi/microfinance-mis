// server/controllers/index.js

// Import all your individual controllers
const authController = require('./authController');
const userController = require('./userController');
const groupController = require('./groupController');
const loanController = require('./loanController');
const savingsController = require('./savingsController');
const transactionController = require('./transactionController');
const meetingController = require('./meetingController');
const notificationController = require('./notificationController');
const reportController = require('./reportController');
const settingsController = require('./settingsController');
const accountController = require('./accountController');

const guarantorController = require('./guarantorController');
const repaymentController = require('./repaymentController');
const chatController = require('./chatController');
const loanAssessmentController = require('./loanAssessmentController');

module.exports = {
  authController,
  userController,
  groupController,
  loanController,
  savingsController,
  transactionController,
  meetingController,
  notificationController,
  reportController,
  settingsController,
  accountController,
  guarantorController,
  repaymentController,
  chatController,
  loanAssessmentController,
};
