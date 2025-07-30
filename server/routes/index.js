// Routes index file - exports all route modules

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const groupRoutes = require('./groupRoutes');
const loanRoutes = require('./loanRoutes');
const savingsRoutes = require('./savingsRoutes');
const transactionRoutes = require('./transactionRoutes');
const meetingRoutes = require('./meetingRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const settingsRoutes = require('./settingsRoutes');
const accountRoutes = require('./accountRoutes');

const guarantorRoutes = require('./guarantorRoutes');
const repaymentRoutes = require('./repaymentRoutes');
const chatRoutes = require('./chatRoutes');
const loanAssessmentRoutes = require('./loanAssessmentRoutes');
const contributionRoutes = require('./contributionRoutes');

module.exports = {
  authRoutes,
  userRoutes,
  groupRoutes,
  loanRoutes,
  savingsRoutes,
  transactionRoutes,
  meetingRoutes,
  notificationRoutes,
  reportRoutes,
  settingsRoutes,
  accountRoutes,
  guarantorRoutes,
  repaymentRoutes,
  chatRoutes,
  loanAssessmentRoutes,
  contributionRoutes,
};
