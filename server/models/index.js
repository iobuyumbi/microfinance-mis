// server\models\index.js
// Models index file - exports all models

const User = require('./User');
const Group = require('./Group');
const Loan = require('./Loan');
const Meeting = require('./Meeting');
const Notification = require('./Notification');
const Transaction = require('./Transaction'); // Now central
const Account = require('./Account');
const Guarantor = require('./Guarantor');
const Settings = require('./Settings'); // Added require
const ChatMessage = require('./ChatMessage');
const CustomGroupRole = require('./CustomGroupRole');
const LoanAssessment = require('./LoanAssessment');
const UserGroupMembership = require('./UserGroupMembership'); // NEW Model

module.exports = {
  User,
  Group,
  Loan,
  Meeting,
  Notification,
  Transaction,
  Account,
  Guarantor,
  Settings,
  ChatMessage,
  CustomGroupRole,
  LoanAssessment,
  UserGroupMembership, // NEW
};
