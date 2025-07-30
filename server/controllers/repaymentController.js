// server\controllers\repaymentController.js (REVISED)
const Transaction = require('../models/Transaction'); // Use Transaction model for repayments
const Loan = require('../models/Loan');
const Account = require('../models/Account'); // To update borrower's account
const User = require('../models/User'); // For populating
const Group = require('../models/Group'); // For populating

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse } = require('../utils'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

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

// @desc    Record a new loan repayment
// @route   POST /api/repayments
// @access  Private (Admin, Officer, or user with 'can_record_repayments' permission)
exports.recordRepayment = asyncHandler(async (req, res, next) => {
  const { loanId, amountPaid, paymentDate, paymentMethod, penalty } = req.body;

  // 1. Basic Validation (already handled by validateRequiredFields for essential fields)
  if (!mongoose.Types.ObjectId.isValid(loanId)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }
  if (amountPaid <= 0) {
    return next(new ErrorResponse('Amount paid must be positive.', 400));
  }

  const loan = await Loan.findById(loanId);
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // Ensure loan is in a repayable status (e.g., 'approved', 'overdue', 'disbursed')
  if (!['approved', 'overdue', 'disbursed'].includes(loan.status)) {
    // Added 'disbursed'
    return next(
      new ErrorResponse(
        `Loan is not in a repayable status. Current status: ${loan.status}.`,
        400
      )
    );
  }

  // 2. Find the borrower's account (assuming the loan's borrower is linked to an account)
  let borrowerAccount = await Account.findOne({
    owner: loan.borrower,
    ownerModel: loan.borrowerModel,
    type: 'savings', // Assuming repayments come from their savings account
    status: 'active',
  });

  if (!borrowerAccount) {
    return next(
      new ErrorResponse(
        'Borrower does not have an active savings account to make repayment from.',
        400
      )
    );
  }

  // 3. Calculate new balance for the borrower's account
  // Repayment DECREASES the borrower's balance
  const newBalance = borrowerAccount.balance - amountPaid;
  if (newBalance < 0) {
    return next(
      new ErrorResponse(
        "Insufficient funds in borrower's account for this repayment.",
        400
      )
    );
  }

  // 4. Create the 'loan_repayment' Transaction record
  const repaymentTransaction = await Transaction.create({
    type: 'loan_repayment',
    member: loan.borrowerModel === 'User' ? loan.borrower : null,
    group: loan.borrowerModel === 'Group' ? loan.borrower : null,
    account: borrowerAccount._id, // Link to the account from which payment was made
    amount: amountPaid,
    description: `Loan repayment for Loan ID: ${loan._id}`,
    status: 'completed', // Assuming immediate completion for repayments
    balanceAfter: newBalance, // Balance after this repayment
    createdBy: req.user.id, // User recording the repayment
    paymentMethod: paymentMethod || 'cash',
    penalty: penalty || 0, // Store penalty if any
    relatedEntity: loan._id,
    relatedEntityType: 'Loan',
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current
  });

  // 5. Update the borrower's account balance
  borrowerAccount.balance = newBalance;
  await borrowerAccount.save();

  // 6. Update the Loan's repayment schedule
  // This part requires careful implementation to accurately track remaining balance and installment statuses.
  // The current logic is a simple iteration. For more robust tracking, consider:
  // - Tracking `loan.amountRepaid` directly.
  // - More complex installment application (e.g., partial payments, applying to overdue first).

  // Update the loan's `amountRepaid` field
  loan.amountRepaid = (loan.amountRepaid || 0) + amountPaid;

  // Update repayment schedule installments
  let remainingPayment = amountPaid;
  for (const installment of loan.repaymentSchedule) {
    if (installment.status === 'pending' && remainingPayment > 0) {
      const amountToPayForInstallment = Math.min(
        remainingPayment,
        installment.amount - (installment.amountPaid || 0)
      );

      installment.amountPaid =
        (installment.amountPaid || 0) + amountToPayForInstallment;
      remainingPayment -= amountToPayForInstallment;

      if (installment.amountPaid >= installment.amount) {
        installment.status = 'paid';
        installment.paidAt = new Date(); // Mark paid date
      }
    }
  }

  // Update loan status if fully paid
  const totalOutstanding = loan.repaymentSchedule
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  if (totalOutstanding <= 0 && loan.amountRepaid >= loan.amountApproved) {
    // Ensure total repaid matches approved amount
    loan.status = 'completed';
  } else if (loan.status === 'approved' && totalOutstanding > 0) {
    // Keep as approved if still outstanding. Overdue check would be a separate scheduled job.
  }

  await loan.save();

  // Populate for response
  await repaymentTransaction.populate([
    {
      path: 'loan',
      select: 'amountApproved borrower borrowerModel status repaymentSchedule',
    },
    { path: 'member', select: 'name email' },
    { path: 'group', select: 'name' },
    { path: 'createdBy', select: 'name email' },
    { path: 'account', select: 'accountNumber type' }, // Populate the account used
  ]);

  // Await async virtuals
  const formattedRepayment = repaymentTransaction.toObject({ virtuals: true });
  formattedRepayment.formattedAmount = await formattedRepayment.formattedAmount;

  res.status(201).json({
    success: true,
    message: 'Loan repayment recorded successfully.',
    data: formattedRepayment,
  });
});

// @desc    Get all loan repayments (system-wide or filtered by user/group)
// @route   GET /api/repayments
// @access  Private (filterDataByRole middleware handles access)
exports.getAllRepayments = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = { type: 'loan_repayment', ...(req.dataFilter || {}) }; // Combine with filterDataByRole
  // const currency = await getCurrency(); // Not directly used here, virtual handles it

  const repayments = await Transaction.find(query)
    .populate('loan', 'amountApproved borrower borrowerModel status')
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  // Await async virtuals
  const formattedRepayments = await Promise.all(
    repayments.map(async rep => {
      const obj = rep.toObject({ virtuals: true });
      obj.formattedAmount = await rep.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedRepayments.length,
    data: formattedRepayments,
  });
});

// @desc    Get all repayments for a specific loan
// @route   GET /api/loans/:loanId/repayments (or /api/repayments/loan/:loanId)
// @access  Private (authorizeLoanAccess middleware handles access)
exports.getRepaymentsByLoan = asyncHandler(async (req, res, next) => {
  const { loanId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(loanId)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }
  // const currency = await getCurrency(); // Not directly used here

  // Access to the loan is already guaranteed by `authorizeLoanAccess` middleware on the route.
  // So, we don't need to apply req.dataFilter here, just fetch transactions for this loan.
  const loan = await Loan.findById(loanId); // Fetch loan to ensure it exists
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  const repayments = await Transaction.find({
    loan: loanId,
    type: 'loan_repayment',
    deleted: false, // Exclude soft-deleted transactions
  })
    .populate('member', 'name email')
    .populate('group', 'name') // If group is relevant for the transaction
    .populate('createdBy', 'name email')
    .sort({ createdAt: 1 }); // Chronological order for history

  // Await async virtuals
  const formattedRepayments = await Promise.all(
    repayments.map(async rep => {
      const obj = rep.toObject({ virtuals: true });
      obj.formattedAmount = await rep.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedRepayments.length,
    data: formattedRepayments,
  });
});

// @desc    Get a specific repayment by Transaction ID
// @route   GET /api/repayments/:id
// @access  Private (filterDataByRole middleware handles access via associated loan)
exports.getRepaymentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new ErrorResponse('Invalid Repayment Transaction ID format.', 400)
    );
  }
  // const currency = await getCurrency(); // Not directly used here

  let query = { _id: id, type: 'loan_repayment', ...(req.dataFilter || {}) }; // Combine with filterDataByRole

  const repaymentTransaction = await Transaction.findOne(query)
    .populate('loan', 'amountApproved borrower borrowerModel status')
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('createdBy', 'name email');

  if (!repaymentTransaction) {
    return next(
      new ErrorResponse(
        'Repayment transaction not found or you do not have access.',
        404
      )
    );
  }

  // Await async virtuals
  const formattedRepayment = repaymentTransaction.toObject({ virtuals: true });
  formattedRepayment.formattedAmount = await formattedRepayment.formattedAmount;

  res.status(200).json({
    success: true,
    data: formattedRepayment,
  });
});

// @desc    Void/Adjust a repayment (instead of deleting)
// @route   PUT /api/repayments/:id/void
// @access  Private (Admin, Officer, or user with 'can_void_repayments' permission)
exports.voidRepayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // ID of the original repayment transaction
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new ErrorResponse('Invalid Repayment Transaction ID format.', 400)
    );
  }
  if (!reason || reason.trim() === '') {
    return next(new ErrorResponse('Reason for voiding is required.', 400));
  }

  // Find the original repayment, ensuring it's a loan_repayment and not already voided/deleted
  const originalRepayment = await Transaction.findOne({
    _id: id,
    type: 'loan_repayment',
    status: 'completed', // Only completed repayments can be voided
    deleted: false, // Ensure it's not already soft-deleted
  });

  if (!originalRepayment) {
    return next(
      new ErrorResponse(
        'Original completed repayment transaction not found or already voided/deleted.',
        404
      )
    );
  }

  // Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Mark the original repayment as voided (soft delete or status change)
    originalRepayment.status = 'voided'; // Use 'voided' status
    originalRepayment.deleted = true; // Mark as soft deleted
    originalRepayment.deletedAt = new Date();
    await originalRepayment.save({ session });

    // 2. Reverse the financial impact on the borrower's account
    const loan = await Loan.findById(originalRepayment.loan).session(session);
    if (!loan) {
      throw new ErrorResponse(
        'Associated loan not found for original repayment.',
        404
      );
    }

    let borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      throw new ErrorResponse('Borrower account not found for reversal.', 404);
    }

    // Add the amount back to the borrower's account
    const newBalance = borrowerAccount.balance + originalRepayment.amount;
    borrowerAccount.balance = newBalance;
    await borrowerAccount.save({ session });

    // 3. Create a new 'adjustment' or 'refund' transaction to record the reversal
    const reversalTransaction = await Transaction.create(
      [
        {
          type: 'loan_repayment_void', // Specific type for voided repayment
          member: originalRepayment.member,
          group: originalRepayment.group,
          account: borrowerAccount._id, // Link to the account that was affected
          amount: originalRepayment.amount,
          description: `Reversal of loan repayment ${originalRepayment._id} (Voided). Reason: ${reason}`,
          status: 'completed',
          balanceAfter: newBalance,
          createdBy: req.user.id,
          relatedEntity: originalRepayment._id, // Link to the original transaction
          relatedEntityType: 'Transaction',
        },
      ],
      { session }
    );

    // 4. Update the Loan's repayment schedule (mark affected installments as pending again)
    let amountToReverse = originalRepayment.amount;
    // Iterate through schedule in reverse to un-pay installments
    for (
      let i = loan.repaymentSchedule.length - 1;
      i >= 0 && amountToReverse > 0;
      i--
    ) {
      const installment = loan.repaymentSchedule[i];
      if (installment.status === 'paid') {
        if (amountToReverse >= installment.amount) {
          installment.status = 'pending';
          installment.paidAt = undefined; // Clear paid date
          installment.amountPaid = 0; // Reset amount paid for this installment
          amountToReverse -= installment.amount;
        } else {
          // This is a partial reversal of an installment.
          // Adjust amountPaid and potentially status to 'partially_paid' if schema supports.
          // For simplicity, if it's a partial reversal, we'll just mark the whole installment as pending
          // and adjust its `amountPaid` accordingly.
          installment.amountPaid =
            (installment.amountPaid || 0) - amountToReverse;
          if (installment.amountPaid < installment.amount) {
            installment.status = 'pending'; // Or 'partially_paid'
            installment.paidAt = undefined;
          }
          amountToReverse = 0; // All reversed
        }
      }
    }

    // Update loan status if it was completed but now has outstanding balance
    const newOutstandingBalance = loan.repaymentSchedule
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    if (loan.status === 'completed' && newOutstandingBalance > 0) {
      loan.status = 'approved'; // Revert to 'approved' or 'overdue' if applicable
    }

    // Also decrement loan.amountRepaid
    loan.amountRepaid = Math.max(
      0,
      (loan.amountRepaid || 0) - originalRepayment.amount
    );

    await loan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Repayment successfully voided and reversed.',
      originalRepayment: originalRepayment, // Return the voided original
      reversalTransaction: reversalTransaction[0], // Return the new reversal transaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Pass the error to the global error handler
    next(error);
  }
});
