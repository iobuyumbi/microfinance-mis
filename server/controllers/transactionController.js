// server\controllers\transactionController.js (NEW FILE / REVISED)
const Transaction = require('../models/Transaction');
const Account = require('../models/Account'); // For updating balances
const User = require('../models/User'); // For populating member details
const Group = require('../models/Group'); // For populating group details
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Helper to get currency (assuming this exists and is consistent)
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

// @desc    Create a new transaction (general purpose, for admin/officer)
// @route   POST /api/transactions
// @access  Private (Admin, Officer) - handled by route middleware
exports.createTransaction = asyncHandler(async (req, res, next) => {
  // This controller is for general-purpose transactions, typically created by admins/officers
  // For specific financial flows like 'savings_contribution', 'loan_disbursement', 'withdrawal', etc.,
  // dedicated controllers (e.g., contributionController, loanController, withdrawalController)
  // should be used, as they contain specific business logic and authorization.

  const {
    type,
    amount,
    description,
    member,
    group,
    account,
    status,
    paymentMethod,
    relatedEntity,
    relatedEntityType,
  } = req.body;

  // Further validation beyond `validateRequiredFields`
  if (amount <= 0) {
    return next(new ErrorResponse('Amount must be positive.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(member)) {
    return next(new ErrorResponse('Invalid member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(group)) {
    return next(new ErrorResponse('Invalid group ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(account)) {
    return next(new ErrorResponse('Invalid account ID format.', 400));
  }

  // Verify existence of linked entities
  const targetMember = await User.findById(member);
  if (!targetMember) return next(new ErrorResponse('Member not found.', 404));
  const targetGroup = await Group.findById(group);
  if (!targetGroup) return next(new ErrorResponse('Group not found.', 404));
  const targetAccount = await Account.findById(account);
  if (!targetAccount)
    return next(new ErrorResponse('Target account not found.', 404));

  // Determine balance change based on transaction type (debit/credit)
  // IMPORTANT: Define your transaction types clearly in your schema/documentation.
  // This logic must be robust and cover all intended transaction types.
  let newBalance;
  const creditTypes = [
    'savings_contribution',
    'loan_repayment',
    'interest_earned',
    'refund',
    'other_credit',
  ];
  const debitTypes = [
    'loan_disbursement',
    'withdrawal',
    'fee',
    'penalty',
    'other_debit',
  ];

  if (creditTypes.includes(type)) {
    newBalance = targetAccount.balance + amount;
  } else if (debitTypes.includes(type)) {
    // Ensure sufficient balance for debit transactions, unless it's an overdraft type account
    if (targetAccount.balance < amount && targetAccount.type === 'savings') {
      // Example: don't allow savings to go negative
      return next(
        new ErrorResponse(
          'Insufficient balance for this transaction type.',
          400
        )
      );
    }
    newBalance = targetAccount.balance - amount;
  } else {
    return next(
      new ErrorResponse(`Unsupported transaction type: ${type}`, 400)
    );
  }

  // Start a Mongoose session for atomicity (crucial for financial operations)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the Transaction record
    const transaction = await Transaction.create(
      [
        {
          type,
          amount,
          description,
          member,
          group,
          account,
          status: status || 'completed', // Default to completed for general transactions
          paymentMethod: paymentMethod || 'system',
          balanceAfter: newBalance, // Crucial for audit trail
          createdBy: req.user.id,
          relatedEntity, // Optional for linking to other entities like loans
          relatedEntityType,
        },
      ],
      { session }
    );

    // Update the account balance
    targetAccount.balance = newBalance;
    await targetAccount.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Populate for response
    await transaction[0].populate([
      { path: 'member', select: 'name email' },
      { path: 'group', select: 'name' },
      { path: 'account', select: 'accountNumber accountName type' },
      { path: 'createdBy', select: 'name' },
    ]);

    const formattedTransaction = transaction[0].toObject({ virtuals: true });
    formattedTransaction.formattedAmount =
      await formattedTransaction.formattedAmount;

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      data: formattedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating transaction:', error);
    next(error); // Pass error to global error handler
  }
});

// @desc    Get all transactions (system-wide or filtered by role)
// @route   GET /api/transactions
// @access  Private (Admin, Officer, Leader, Member - filtered by role) - handled by route middleware
exports.getTransactions = asyncHandler(async (req, res, next) => {
  // `req.dataFilter` is set by the `filterDataByRole('Transaction')` middleware.
  // It will contain conditions for `member`, `group`, and `loan` access, etc.
  let query = { ...(req.dataFilter || {}) };

  // Allow additional query parameters for filtering
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  // If specific memberId or groupId are passed in query, they will act as further filters
  // on top of what req.dataFilter provides.
  if (req.query.memberId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.memberId)) {
      return next(new ErrorResponse('Invalid Member ID format.', 400));
    }
    query.member = req.query.memberId;
  }
  if (req.query.groupId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.groupId)) {
      return next(new ErrorResponse('Invalid Group ID format.', 400));
    }
    query.group = req.query.groupId;
  }
  // You could also add date range filters (startDate, endDate) here.

  const transactions = await Transaction.find(query)
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('account', 'accountNumber accountName type')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 }); // Sort by newest first

  const formattedTransactions = await Promise.all(
    transactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      obj.formattedAmount = await obj.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedTransactions.length,
    data: formattedTransactions,
  });
});

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private (Admin, Officer, Leader, Member - filtered by role) - handled by route middleware
exports.getTransactionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // `req.dataFilter` is set by the `filterDataByRole` middleware.
  let query = { _id: id, ...(req.dataFilter || {}) };

  const transaction = await Transaction.findOne(query)
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('account', 'accountNumber accountName type')
    .populate('createdBy', 'name');

  if (!transaction) {
    return next(
      new ErrorResponse('Transaction not found or you do not have access.', 404)
    );
  }

  const formattedTransaction = transaction.toObject({ virtuals: true });
  formattedTransaction.formattedAmount =
    await formattedTransaction.formattedAmount;

  res.status(200).json({
    success: true,
    data: formattedTransaction,
  });
});

// @desc    Update a transaction (only non-financial fields or status changes that don't affect balance)
// @route   PUT /api/transactions/:id
// @access  Private (Admin, Officer) - handled by route middleware
exports.updateTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // Explicitly allow only non-financial fields for update
  const { description, status, paymentMethod } = req.body;

  // Prevent direct modification of core financial fields or linked entities
  const prohibitedFields = [
    'amount',
    'type',
    'member',
    'group',
    'account',
    'balanceAfter',
    'createdBy',
    'relatedEntity',
    'relatedEntityType',
  ];
  for (const field of prohibitedFields) {
    if (req.body[field] !== undefined) {
      return next(
        new ErrorResponse(
          `Direct modification of '${field}' is not allowed for transactions. Create an adjustment if needed.`,
          400
        )
      );
    }
  }

  // Apply data filter from middleware for initial retrieval
  let transaction = await Transaction.findOne({
    _id: id,
    ...(req.dataFilter || {}),
  });

  if (!transaction) {
    return next(
      new ErrorResponse(
        'Transaction not found or you do not have access to update.',
        404
      )
    );
  }

  // Critical check for status changes:
  // If changing from 'completed' to 'cancelled' or 'failed', require a separate adjustment.
  if (status && status !== transaction.status) {
    if (
      transaction.status === 'completed' &&
      (status === 'cancelled' || status === 'failed')
    ) {
      return next(
        new ErrorResponse(
          'Changing a completed transaction to cancelled/failed requires a separate adjustment transaction to reverse its financial impact.',
          400
        )
      );
    }
  }

  const updates = {};
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
  updates.updatedAt = new Date(); // Update timestamp on modification

  // Find and update the transaction document
  transaction = await Transaction.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('account', 'accountNumber accountName type')
    .populate('createdBy', 'name');

  if (!transaction) {
    // Should not happen if previous findOne found it, but good defensive check
    return next(new ErrorResponse('Transaction could not be updated.', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Transaction updated successfully (non-financial fields).',
    data: transaction,
  });
});

// @desc    Soft delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private (Admin, Officer) - handled by route middleware
exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Apply data filter from middleware for initial retrieval
  const transaction = await Transaction.findOne({
    _id: id,
    ...(req.dataFilter || {}),
  });

  if (!transaction) {
    return next(
      new ErrorResponse(
        'Transaction not found or you do not have access to delete.',
        404
      )
    );
  }

  // Critical check: If the transaction was 'completed' and not already soft-deleted,
  // prevent direct soft-deletion without an explicit financial reversal.
  if (transaction.status === 'completed' && !transaction.deleted) {
    return next(
      new ErrorResponse(
        'Cannot directly delete a completed transaction. Please create a "reversal" or "adjustment" transaction to negate its financial impact first, then soft-delete this record.',
        400
      )
    );
  }

  // Perform soft delete
  transaction.deleted = true;
  transaction.deletedAt = new Date();
  transaction.deletedBy = req.user.id; // Record who soft-deleted it
  await transaction.save();

  res.status(200).json({
    success: true,
    message: 'Transaction soft-deleted successfully.',
    data: {}, // No data returned for delete operations typically
  });
});
