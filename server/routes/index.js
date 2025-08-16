// server/routes/index.js
const express = require('express');
const router = express.Router();

// Modular route imports
const memberRoutes = require('./memberRoutes');
const groupRoutes = require('./groupRoutes');
const groupMembershipRoutes = require('./groupMembershipRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
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
const loanAssessmentRoutes = require('./loanAssessmentRoutes');
const chatRoutes = require('./chatRoutes');
const contributionRoutes = require('./contributionRoutes');
const healthRoutes = require('./healthRoutes');

// --- API Route Mounts ---
// All member-related endpoints
router.use('/members', memberRoutes);
// All group-related endpoints
router.use('/groups', groupRoutes);
// All group membership endpoints (nested under /members for clarity)
router.use('/members', groupMembershipRoutes);

module.exports = {
  authRoutes,
  userRoutes,
  memberRoutes,
  groupRoutes,
  groupMembershipRoutes,
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
  loanAssessmentRoutes,
  chatRoutes,
  contributionRoutes,
  healthRoutes,
};
