// server\controllers\accountController.js
const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction'); // Will be used for checks
const Loan = require('../models/Loan'); // Will be used for checks

const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse } = require('../utils');

// Helper to get currency from settings (async virtuals need this in controllers)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('../models/Settings').schema);
    appSettings = await Settings.findOne({ settingsId: 'app_settings' });
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Private (Admin, Officer) - via authorize middleware
exports.createAccount = asyncHandler(async (req, res, next) => {
  const { owner, ownerModel, type, accountNumber, status } = req.body;

  // Basic validation
  if (!owner || !ownerModel || !type) {
    return next(
      new ErrorResponse('Owner, ownerModel, and type are required.', 400)
    );
  }
  if (!mongoose.Types.ObjectId.isValid(owner)) {
    return next(new ErrorResponse('Invalid owner ID format.', 400));
  }
  if (!['User', 'Group'].includes(ownerModel)) {
    return next(
      new ErrorResponse('ownerModel must be "User" or "Group".', 400)
    );
  }
  if (
    !['savings', 'loan_fund', 'operating_expense', 'revenue'].includes(type)
  ) {
    return next(new ErrorResponse('Invalid account type.', 400));
  }

  // Check if an account of this type already exists for the owner
  const existingAccount = await Account.findOne({ owner, ownerModel, type });
  if (existingAccount) {
    return next(
      new ErrorResponse(
        `An account of type '${type}' already exists for this ${ownerModel}.`,
        400
      )
    );
  }

  // You might want to auto-generate accountNumber if not provided, or ensure uniqueness
  // For now, let's assume it's provided or a pre-save hook handles it.
  // If accountNumber is auto-generated, remove it from validateRequiredFields in route.
  if (!accountNumber) {
    // Example: Auto-generate simple account number
    // In a real app, this needs to be more robust and unique.
    const currentCount = await Account.countDocuments();
    req.body.accountNumber = `ACC-${(currentCount + 1).toString().padStart(6, '0')}`;
  }

  const account = await Account.create({
    owner,
    ownerModel,
    type,
    accountNumber: req.body.accountNumber, // Use generated if not provided
    status: status || 'active', // Default to active
    balance: 0, // Always start at 0, balance changes via transactions
  });

  // Populate for response
  await account.populate('owner', 'name email groupName'); // Populate owner details

  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: formattedAccount,
  });
});

// @desc    Get all accounts (filtered by role via middleware)
// @route   GET /api/accounts
// @access  Private (filterDataByRole middleware handles access)
exports.getAccounts = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = req.dataFilter || {};
  const currency = await getCurrency();

  const accounts = await Account.find(query)
    .populate('owner', 'name email groupName') // Populate owner details
    .sort({ createdAt: -1 });

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

// @desc    Get a single account by ID
// @route   GET /api/accounts/:id
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getAccountById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid account ID format.', 400));
  }

  const currency = await getCurrency();

  // Query will be filtered by authorizeOwnerOrAdmin if implemented via findOne
  const account = await Account.findById(id).populate(
    'owner',
    'name email groupName'
  ); // Populate owner details

  if (!account) {
    return next(
      new ErrorResponse('Account not found or you do not have access.', 404)
    );
  }

  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(200).json({
    success: true,
    data: formattedAccount,
  });
});

// @desc    Update account metadata (NOT balance or type)
// @route   PUT /api/accounts/:id
// @access  Private (Admin, Officer, or Group Leader for group accounts) - via authorize middleware
exports.updateAccount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, description, accountName } = req.body; // Allowed fields to update

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid account ID format.', 400));
  }

  const account = await Account.findById(id);

  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }

  // Prevent direct modification of balance, owner, ownerModel, accountNumber, type
  const forbiddenUpdates = [
    'balance',
    'owner',
    'ownerModel',
    'accountNumber',
    'type',
  ];
  const receivedUpdates = Object.keys(req.body);
  const attemptedForbiddenUpdates = receivedUpdates.filter(field =>
    forbiddenUpdates.includes(field)
  );

  if (attemptedForbiddenUpdates.length > 0) {
    return next(
      new ErrorResponse(
        `Cannot directly update fields: ${attemptedForbiddenUpdates.join(', ')}. Balance changes via transactions only.`,
        400
      )
    );
  }

  // Apply allowed updates
  if (status !== undefined) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(
          `Invalid status provided. Must be one of: ${validStatuses.join(', ')}.`,
          400
        )
      );
    }
    account.status = status;
  }
  // If you add description or accountName to your schema
  // if (description !== undefined) account.description = description;
  // if (accountName !== undefined) account.accountName = accountName;

  await account.save();

  // Populate for response
  await account.populate('owner', 'name email groupName');

  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(200).json({
    success: true,
    message: 'Account metadata updated successfully.',
    data: formattedAccount,
  });
});

// @desc    Delete an account (soft delete recommended)
// @route   DELETE /api/accounts/:id
// @access  Private (Admin only) - via authorize middleware
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid account ID format.', 400));
  }

  const account = await Account.findById(id);

  if (!account) {
    return next(new ErrorResponse('Account not found.', 404));
  }

  // **CRITICAL FINANCIAL INTEGRITY CHECKS**
  // 1. Cannot delete an account with a non-zero balance
  if (account.balance !== 0) {
    return next(
      new ErrorResponse(
        'Cannot delete an account with a non-zero balance. Transfer funds out first.',
        400
      )
    );
  }

  // 2. Cannot delete an account if it's tied to active loans (e.g., loan_fund)
  const activeLoans = await Loan.countDocuments({
    $or: [
      { loanAccount: account._id }, // If this account is the source/destination of loans
      { repaymentAccount: account._id }, // If this account is for repayments
    ],
    status: { $in: ['pending', 'approved', 'disbursed', 'active'] }, // Active loan statuses
  });
  if (activeLoans > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete account with active or pending loans associated with it.',
        400
      )
    );
  }

  // 3. Optional: Check if there are recent transactions (even if balance is 0)
  // You might want to prevent deletion for N days after last transaction, for audit trail.
  // const recentTransactions = await Transaction.countDocuments({
  //     account: account._id,
  //     createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  // });
  // if (recentTransactions > 0) {
  //     return next(new ErrorResponse('Cannot delete account with recent transactions. Wait 30 days for audit trail.', 400));
  // }

  // Implement soft delete instead of hard delete for auditability
  account.status = 'inactive'; // Or 'closed' if you add that enum value
  account.deleted = true;
  account.deletedAt = new Date();
  await account.save();

  res.status(200).json({
    success: true,
    message:
      'Account soft-deleted (status changed to inactive/closed) successfully.',
    data: {},
  });
});
