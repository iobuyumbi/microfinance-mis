// Models index file - exports all models

const User = require('./User');
const Group = require('./Group');
const Loan = require('./Loan');
const Repayment = require('./Repayment');
const Meeting = require('./Meeting');
const Notification = require('./Notification');
const Savings = require('./Savings');
const Transaction = require('./Transaction');
const Account = require('./Account');
const AccountHistory = require('./AccountHistory');
const Guarantor = require('./Guarantor');

module.exports = {
  User,
  Group,
  Loan,
  Repayment,
  Meeting,
  Notification,
  Savings,
  Transaction,
  Account,
  AccountHistory,
  Guarantor,
  Settings,
  ChatMessage,
  CustomGroupRole,
  LoanAssessment,
};
