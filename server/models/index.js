// server\models\index.js
// Models index file - exports all models

const User = require('./User');
const Group = require('./Group');
const Loan = require('./Loan');
const Transaction = require('./Transaction');
const Meeting = require('./Meeting');
const Notification = require('./Notification');
const Settings = require('./Settings');
const Account = require('./Account');

const Guarantor = require('./Guarantor');
const ChatMessage = require('./ChatMessage');
const LoanAssessment = require('./LoanAssessment');
const CustomGroupRole = require('./CustomGroupRole');
const UserGroupMembership = require('./UserGroupMembership');

module.exports = {
  User,
  Group,
  Loan,
  Transaction,
  Meeting,
  Notification,
  Settings,
  Account,
  Guarantor,
  ChatMessage,
  LoanAssessment,
  CustomGroupRole,
  UserGroupMembership,
};
