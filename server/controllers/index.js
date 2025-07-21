// Controllers index file - exports all controller functions

const authController = require("./authController");
const userController = require("./userController");
const groupController = require("./groupController");
const loanController = require("./loanController");
const repaymentController = require("./repaymentController");
const meetingController = require("./meetingController");
const reportController = require("./reportController");
const notificationController = require("./notificationController");
const savingsController = require("./savingsController");
const transactionController = require("./transactionController");
const accountController = require("./accountController");
const accountHistoryController = require("./accountHistoryController");
const guarantorController = require("./guarantorController");

module.exports = {
  authController,
  userController,
  groupController,
  loanController,
  repaymentController,
  meetingController,
  reportController,
  notificationController,
  savingsController,
  transactionController,
  accountController,
  accountHistoryController,
  guarantorController,
};
