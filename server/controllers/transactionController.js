// server\controllers\transactionController.js
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account'); // For populating related account details
const User = require('../models/User'); // For populating related member details
const Group = require('../models/Group'); // For populating related group details
const Loan = require('../models/Loan'); // For populating related loan details

const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

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

// @desc    Create a generic transaction (e.g., for system adjustments, interest accruals)
//          NOTE: For user-initiated financial movements (deposits, withdrawals, loan disb/repay),
//          use specific controllers (savingsController, loanController) as they update balances.
// @route   POST /api/transactions
// @access  Private (Admin, Officer, or specific 'can_create_transaction' permission)
exports.createTransaction = asyncHandler(async (req, res, next) => {
  const {
    amount,
    type,
    account,
    member,
    group,
    loan,
    description,
    status,
    paymentMethod,
    penalty,
    balanceAfter,
  } = req.body;

  // Basic validation
  if (amount === undefined || amount === null || amount < 0 || !type) {
    return next(
      new ErrorResponse(
        'Amount and type are required, and amount must be non-negative.',
        400
      )
    );
  }
  if (account && !mongoose.Types.ObjectId.isValid(account)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }
  if (member && !mongoose.Types.ObjectId.isValid(member)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (group && !mongoose.Types.ObjectId.isValid(group)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (loan && !mongoose.Types.ObjectId.isValid(loan)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

  // Ensure at least one related entity (account, member, group, loan) is provided for context
  if (!account && !member && !group && !loan) {
    return next(
      new ErrorResponse(
        'At least one related entity (account, member, group, or loan) is required for a transaction.',
        400
      )
    );
  }

  // Create the transaction record
  const transaction = await Transaction.create({
    amount,
    type,
    account,
    member,
    group,
    loan,
    description,
    status: status || 'completed', // Default to completed for generic transactions
    balanceAfter, // This should be calculated and provided by the caller if relevant
    createdBy: req.user.id,
    paymentMethod,
    penalty,
  });

  // Populate for response
  await transaction.populate(
    'account',
    'accountNumber owner ownerModel type balance'
  );
  await transaction.populate('member', 'name email');
  await transaction.populate('group', 'name');
  await transaction.populate('loan', 'amountApproved borrower borrowerModel');
  await transaction.populate('createdBy', 'name email');

  // Await async virtual for formatting
  const formattedTransaction = transaction.toObject({ virtuals: true });
  formattedTransaction.formattedAmount = await transaction.formattedAmount;

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully.',
    data: formattedTransaction,
  });
});

// @desc    Get all transactions (filtered by user access)
// @route   GET /api/transactions
// @access  Private (filterDataByRole middleware handles access)
exports.getTransactions = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = req.dataFilter || {};
  const currency = await getCurrency();

  const transactions = await Transaction.find(query)
    .populate('account', 'accountNumber owner ownerModel type balance')
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('loan', 'amountApproved borrower borrowerModel')
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

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private (authorizeTransactionAccess middleware handles access)
exports.getTransactionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid transaction ID format.', 400));
  }
  const currency = await getCurrency();

  let query = { _id: id };
  // Apply data filter from middleware (if any)
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const transaction = await Transaction.findOne(query)
    .populate('account', 'accountNumber owner ownerModel type balance')
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('loan', 'amountApproved borrower borrowerModel')
    .populate('createdBy', 'name email');

  if (!transaction) {
    return next(
      new ErrorResponse('Transaction not found or you do not have access.', 404)
    );
  }

  // Await async virtual for formatting
  const formattedTransaction = transaction.toObject({ virtuals: true });
  formattedTransaction.formattedAmount =
    await formattedTransaction.formattedAmount;

  res.status(200).json({
    success: true,
    data: formattedTransaction,
  });
});

// @desc    Update transaction (only for non-financial metadata or status change if allowed)
//          NOTE: Direct financial changes should be handled via new adjustment transactions.
// @route   PUT /api/transactions/:id
// @access  Private (Admin, Officer, or specific 'can_update_transaction' permission)
exports.updateTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { description, status, paymentMethod } = req.body; // Allowed fields to update

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid transaction ID format.', 400));
  }
  const currency = await getCurrency();

  let transaction = await Transaction.findById(id);

  if (!transaction) {
    return next(new ErrorResponse('Transaction not found.', 404));
  }

  // Prevent direct modification of core financial fields like 'amount', 'type', 'account', 'member', 'group', 'loan'
  // These fields are immutable for completed financial records.
  const forbiddenUpdates = [
    'amount',
    'type',
    'account',
    'member',
    'group',
    'loan',
    'balanceAfter',
  ];
  const receivedUpdates = Object.keys(req.body);
  const attemptedForbiddenUpdates = receivedUpdates.filter(field =>
    forbiddenUpdates.includes(field)
  );

  if (attemptedForbiddenUpdates.length > 0) {
    return next(
      new ErrorResponse(
        `Cannot directly update financial fields: ${attemptedForbiddenUpdates.join(', ')}. Create an adjustment transaction instead.`,
        400
      )
    );
  }

  // Update allowed fields
  if (description !== undefined) transaction.description = description;
  if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
  if (status !== undefined) {
    // Handle status changes carefully. If changing from 'completed' to 'cancelled'/'void',
    // it might imply a need for a reversal transaction (handled in voidRepayment, etc.)
    const validStatuses = [
      'pending',
      'completed',
      'cancelled',
      'failed',
      'voided',
    ];
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(
          `Invalid status provided. Must be one of: ${validStatuses.join(', ')}.`,
          400
        )
      );
    }
    transaction.status = status;
  }

  await transaction.save();

  // Populate for response
  await transaction.populate(
    'account',
    'accountNumber owner ownerModel type balance'
  );
  await transaction.populate('member', 'name email');
  await transaction.populate('group', 'name');
  await transaction.populate('loan', 'amountApproved borrower borrowerModel');
  await transaction.populate('createdBy', 'name email');

  // Await async virtual for formatting
  const formattedTransaction = transaction.toObject({ virtuals: true });
  formattedTransaction.formattedAmount =
    await formattedTransaction.formattedAmount;

  res.status(200).json({
    success: true,
    message: 'Transaction updated successfully (metadata only).',
    data: formattedTransaction,
  });
});

// @desc    Soft delete a transaction (recommended over hard delete for auditability)
// @route   DELETE /api/transactions/:id
// @access  Private (Admin, Officer, or specific 'can_delete_transaction' permission)
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid transaction ID format.', 400));
  }

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    return next(new ErrorResponse('Transaction not found.', 404));
  }

  // IMPORTANT: For financial records, hard deleting is strongly discouraged.
  // Instead, perform a soft delete or, for completed transactions, require a reversal/adjustment transaction.

  // If the transaction is 'completed' and not already marked as deleted/voided,
  // prevent direct soft deletion without a financial reversal.
  if (
    transaction.status === 'completed' &&
    !transaction.deleted &&
    !['adjustment', 'loan_repayment_void'].includes(transaction.type)
  ) {
    return next(
      new ErrorResponse(
        'Cannot directly delete a completed financial transaction. Please create a reversal/adjustment transaction to correct its financial impact.',
        400
      )
    );
  }

  // Perform soft delete
  transaction.deleted = true;
  transaction.deletedAt = new Date();
  await transaction.save();

  res.status(200).json({
    success: true,
    message: 'Transaction soft-deleted successfully.',
    data: {}, // Return empty data for delete success
  });
});
