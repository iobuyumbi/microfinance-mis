// server\controllers\savingsController.js
const Account = require('../models/Account');
const Transaction = require('../models/Transaction'); // Used for all financial movements
const User = require('../models/User'); // For populating owner
const Group = require('../models/Group'); // For populating owner

const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get currency from settings (async virtuals need this in controllers)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('../models/Settings').schema);
    appSettings = await Settings.findById('app_settings');
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

// @desc    Record a new deposit into an account
// @route   POST /api/savings/deposit
// @access  Private (Admin, Officer, or user with 'can_record_deposits' permission for their own/group account)
exports.recordDeposit = asyncHandler(async (req, res, next) => {
  const { accountId, amount, paymentMethod, description } = req.body;

  // 1. Basic Validation
  if (!accountId || !amount || amount <= 0) {
    return next(
      new ErrorResponse(
        'Account ID and a positive deposit amount are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  const account = await Account.findById(accountId);
  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }

  // Ensure it's a savings account (or relevant account type for deposits)
  if (!['savings', 'group_savings'].includes(account.type)) {
    return next(
      new ErrorResponse(
        'Deposits can only be made to savings or group savings accounts.',
        400
      )
    );
  }

  // 2. Access Control (assuming middleware handles 'can_record_deposits' and `authorizeOwnerOrAdmin` for accounts)
  // For example, a member can deposit into their own savings account, officers/admins into any.

  // 3. Update account balance
  const newBalance = account.balance + amount;
  account.balance = newBalance;
  await account.save();

  // 4. Create a new 'deposit' Transaction record
  const depositTransaction = await Transaction.create({
    type: 'deposit',
    member: account.ownerModel === 'User' ? account.owner : null,
    group: account.ownerModel === 'Group' ? account.owner : null,
    account: account._id, // Link to the specific account
    amount: amount,
    description:
      description ||
      `Deposit into ${account.ownerModel === 'User' ? 'personal' : 'group'} savings account`,
    status: 'completed',
    balanceAfter: newBalance,
    createdBy: req.user.id,
    paymentMethod: paymentMethod || 'cash',
  });

  // Populate for response
  await depositTransaction.populate(
    'account',
    'name accountNumber owner ownerModel type'
  );
  await depositTransaction.populate('member', 'name email');
  await depositTransaction.populate('group', 'name');
  await depositTransaction.populate('createdBy', 'name email');

  // Await async virtuals for formatting
  const formattedDeposit = depositTransaction.toObject({ virtuals: true });
  formattedDeposit.formattedAmount = await depositTransaction.formattedAmount;
  formattedDeposit.account.formattedBalance =
    await depositTransaction.account.formattedBalance;

  res.status(201).json({
    success: true,
    message: 'Deposit recorded successfully.',
    data: formattedDeposit,
  });
});

// @desc    Record a new withdrawal from an account
// @route   POST /api/savings/withdraw
// @access  Private (Admin, Officer, or user with 'can_record_withdrawals' permission for their own/group account)
exports.recordWithdrawal = asyncHandler(async (req, res, next) => {
  const { accountId, amount, paymentMethod, description } = req.body;

  // 1. Basic Validation
  if (!accountId || !amount || amount <= 0) {
    return next(
      new ErrorResponse(
        'Account ID and a positive withdrawal amount are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  const account = await Account.findById(accountId);
  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }

  // Ensure it's a savings account (or relevant account type for withdrawals)
  if (!['savings', 'group_savings'].includes(account.type)) {
    return next(
      new ErrorResponse(
        'Withdrawals can only be made from savings or group savings accounts.',
        400
      )
    );
  }

  // 2. Check for sufficient funds
  if (account.balance < amount) {
    return next(
      new ErrorResponse(
        'Insufficient funds in account for this withdrawal.',
        400
      )
    );
  }

  // 3. Update account balance
  const newBalance = account.balance - amount;
  account.balance = newBalance;
  await account.save();

  // 4. Create a new 'withdrawal' Transaction record
  const withdrawalTransaction = await Transaction.create({
    type: 'withdrawal',
    member: account.ownerModel === 'User' ? account.owner : null,
    group: account.ownerModel === 'Group' ? account.owner : null,
    account: account._id, // Link to the specific account
    amount: amount,
    description:
      description ||
      `Withdrawal from ${account.ownerModel === 'User' ? 'personal' : 'group'} savings account`,
    status: 'completed',
    balanceAfter: newBalance,
    createdBy: req.user.id,
    paymentMethod: paymentMethod || 'cash',
  });

  // Populate for response
  await withdrawalTransaction.populate(
    'account',
    'name accountNumber owner ownerModel type'
  );
  await withdrawalTransaction.populate('member', 'name email');
  await withdrawalTransaction.populate('group', 'name');
  await withdrawalTransaction.populate('createdBy', 'name email');

  // Await async virtuals for formatting
  const formattedWithdrawal = withdrawalTransaction.toObject({
    virtuals: true,
  });
  formattedWithdrawal.formattedAmount =
    await withdrawalTransaction.formattedAmount;
  formattedWithdrawal.account.formattedBalance =
    await withdrawalTransaction.account.formattedBalance;

  res.status(200).json({
    success: true,
    message: 'Withdrawal recorded successfully.',
    data: formattedWithdrawal,
  });
});

// @desc    Get a specific account by ID (e.g., to check balance)
// @route   GET /api/accounts/:id
// @access  Private (Admin, Officer, or Account Owner) - authorizeOwnerOrAdmin middleware
exports.getAccountById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  // `req.dataFilter` could be applied here if `filterDataByRole` is used for single fetch
  // but `authorizeOwnerOrAdmin` middleware is more direct for specific account access.
  const account = await Account.findById(id)
    .populate('owner', 'name email') // Populate owner (User or Group)
    .populate('members', 'name email'); // If it's a group account, populate its members

  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }

  // Await async virtuals for formatting
  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(200).json({
    success: true,
    data: formattedAccount,
  });
});

// @desc    Get all accounts accessible by the user
// @route   GET /api/accounts
// @access  Private (filterDataByRole middleware handles access)
exports.getAllAccounts = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = req.dataFilter || {};
  const currency = await getCurrency();

  const accounts = await Account.find(query)
    .populate('owner', 'name email') // Populate owner (User or Group)
    .populate('members', 'name email'); // If it's a group account, populate its members

  // Await async virtuals for formatting
  const formattedAccounts = await Promise.all(
    accounts.map(async acc => {
      const obj = acc.toObject({ virtuals: true });
      obj.formattedBalance = await acc.formattedBalance;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedAccounts.length,
    data: formattedAccounts,
  });
});

// @desc    Get transaction history for a specific account (deposits, withdrawals, etc.)
// @route   GET /api/accounts/:id/transactions
// @access  Private (Admin, Officer, or Account Owner) - authorizeOwnerOrAdmin middleware
exports.getAccountTransactions = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Account ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  const currency = await getCurrency();

  // First, verify access to the account itself. This is ideally done via middleware.
  const account = await Account.findById(id);
  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }
  // The `authorizeOwnerOrAdmin` middleware on the route will ensure access here.

  const transactions = await Transaction.find({
    account: id,
    deleted: false, // Exclude soft-deleted transactions
    type: { $in: ['deposit', 'withdrawal', 'transfer', 'loan_disbursement'] }, // Only show relevant account transactions
  })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 }); // Latest transactions first

  // Await async virtuals for formatting
  const formattedTransactions = await Promise.all(
    transactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      obj.formattedAmount = await tx.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedTransactions.length,
    data: formattedTransactions,
  });
});
