// Routes index file - exports all route modules

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const groupRoutes = require("./groupRoutes");
const loanRoutes = require("./loanRoutes");
const repaymentRoutes = require("./repaymentRoutes");
const meetingRoutes = require("./meetingRoutes");
const reportRoutes = require("./reportRoutes");
const notificationRoutes = require("./notificationRoutes");
const savingsRoutes = require("./savingsRoutes");
const transactionRoutes = require("./transactionRoutes");
const accountRoutes = require("./accountRoutes");
const accountHistoryRoutes = require("./accountHistoryRoutes");
const guarantorRoutes = require("./guarantorRoutes");
const settingsRoutes = require("./settingsRoutes");

module.exports = {
  authRoutes,
  userRoutes,
  groupRoutes,
  loanRoutes,
  repaymentRoutes,
  meetingRoutes,
  reportRoutes,
  notificationRoutes,
  savingsRoutes,
  transactionRoutes,
  accountRoutes,
  accountHistoryRoutes,
  guarantorRoutes,
  settingsRoutes,
};
