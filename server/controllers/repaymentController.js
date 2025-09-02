// server\controllers\repaymentController.js (REVISED with improvements)
const Transaction = require('../models/Transaction'); // Use Transaction model for repayments
const Loan = require('../models/Loan');
const Account = require('../models/Account'); // To update borrower's account
const User = require('../models/User'); // For populating
const Group = require('../models/Group'); // For populating

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse } = require('../utils'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get currency from settings (async virtuals need this in controllers)
// Re-read settings each time for potential updates, or implement a caching mechanism
async function getCurrency() {
  // Moved appSettings inside, or consider a proper caching strategy
  const Settings =
    mongoose.models.Settings ||
    mongoose.model('Settings', require('../models/Settings').schema);
  const appSettings = await Settings.findOne({ settingsId: 'app_settings' });
  if (!appSettings) {
    console.warn('Settings document not found. Using default currency USD.');
    return 'USD'; // Fallback
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

  // Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      throw new ErrorResponse('Loan not found.', 404);
    }

    // Ensure loan is in a repayable status (e.g., 'approved', 'overdue', 'disbursed')
    if (!['approved', 'overdue', 'disbursed'].includes(loan.status)) {
      throw new ErrorResponse(
        `Loan is not in a repayable status. Current status: ${loan.status}.`,
        400
      );
    }

    // 2. Find the borrower's account (assuming the loan's borrower is linked to an account)
    // Repayments typically originate from a savings/current account or cash.
    // Assuming 'savings' for now, but in a real system, you'd allow payment from various sources
    // and link to the relevant account type.
    const borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings', // Assuming repayments come from their savings account
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      throw new ErrorResponse(
        'Borrower does not have an active savings account to make repayment from. (Or cash payment is not yet supported)',
        400
      );
    }

    // 3. Calculate new balance for the borrower's account
    // Repayment DECREASES the borrower's account balance
    const newBorrowerBalance = borrowerAccount.balance - amountPaid;
    if (newBorrowerBalance < 0) {
      throw new ErrorResponse(
        "Insufficient funds in borrower's account for this repayment.",
        400
      );
    }

    // 4. Update the borrower's account balance
    borrowerAccount.balance = newBorrowerBalance;
    await borrowerAccount.save({ session });

    // 5. Update the Loan's repayment schedule and total amount repaid
    loan.amountRepaid = (loan.amountRepaid || 0) + amountPaid;

    let remainingPaymentToApply = amountPaid;
    for (const installment of loan.repaymentSchedule) {
      if (installment.status === 'pending' && remainingPaymentToApply > 0) {
        const amountDueForInstallment =
          installment.amount - (installment.amountPaid || 0);
        const amountToApply = Math.min(
          remainingPaymentToApply,
          amountDueForInstallment
        );

        installment.amountPaid = (installment.amountPaid || 0) + amountToApply;
        remainingPaymentToApply -= amountToApply;

        if (installment.amountPaid >= installment.amount) {
          installment.status = 'paid';
          installment.paidAt = new Date();
        } else if (installment.amountPaid > 0) {
          // If partially paid, you might want a 'partially_paid' status
          // For now, it remains 'pending' if not fully paid, which is acceptable for simple logic
        }
      }
    }

    // Update loan status based on total outstanding
    const totalOutstanding = loan.repaymentSchedule
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount - (r.amountPaid || 0)), 0); // Calculate actual remaining debt

    if (totalOutstanding <= 0 && loan.amountRepaid >= loan.amountApproved) {
      loan.status = 'completed';
    } else if (loan.status === 'disbursed' && totalOutstanding > 0) {
      // Loan remains 'disbursed' or becomes 'overdue' (handled by a separate job typically)
      // No change needed here unless there's an immediate status update rule.
    } else if (loan.status === 'approved' && totalOutstanding > 0) {
      // A loan usually transitions from 'approved' to 'disbursed' *before* repayments.
      // If a repayment comes in while status is 'approved', it's unusual.
      // Let's assume it should move to 'disbursed' if it wasn't already.
      loan.status = 'disbursed'; // Or keep it as is, depending on your workflow
    }

    await loan.save({ session });

    // 6. Create the 'loan_repayment' Transaction record
    const repaymentTransaction = await Transaction.create(
      [
        {
          type: 'loan_repayment',
          member: loan.borrowerModel === 'User' ? loan.borrower : null,
          group: loan.borrowerModel === 'Group' ? loan.borrower : null,
          account: borrowerAccount._id, // Link to the account from which payment was made
          amount: amountPaid,
          description: `Loan repayment for Loan ID: ${loan._id}`,
          status: 'completed',
          balanceAfter: newBorrowerBalance, // Balance after this repayment
          createdBy: req.user.id, // User recording the repayment
          paymentMethod: paymentMethod || 'cash',
          penalty: penalty || 0, // Store penalty if any
          relatedEntity: loan._id,
          relatedEntityType: 'Loan',
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(), // Use provided date or current
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate for response (outside session after commit)
    await repaymentTransaction[0].populate([
      // Access the created document from the array
      {
        path: 'relatedEntity', // Use relatedEntity instead of 'loan' directly if schema uses that
        select:
          'amountApproved borrower borrowerModel status repaymentSchedule',
        model: 'Loan', // Specify model if relatedEntity is polymorphic
      },
      { path: 'member', select: 'name email' },
      { path: 'group', select: 'name' },
      { path: 'createdBy', select: 'name email' },
      { path: 'account', select: 'accountNumber type' }, // Populate the account used
    ]);

    // Await async virtuals
    const formattedRepayment = repaymentTransaction[0].toObject({
      virtuals: true,
    }); // Access the created document
    formattedRepayment.formattedAmount =
      await formattedRepayment.formattedAmount;

    res.status(201).json({
      success: true,
      message: 'Loan repayment recorded successfully.',
      data: formattedRepayment,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error recording loan repayment:', error);
    next(error); // Pass error to global error handler
  }
});

// @desc    Get all loan repayments (system-wide or filtered by user/group)
// @route   GET /api/repayments
// @access  Private (filterDataByRole middleware handles access)
exports.getAllRepayments = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = {
    type: 'loan_repayment',
    deleted: false,
    ...(req.dataFilter || {}),
  }; // Combine with filterDataByRole and ensure not deleted

  const repayments = await Transaction.find(query)
    .populate({
      path: 'relatedEntity',
      select: 'amountApproved borrower borrowerModel status',
      model: 'Loan', // Specify model if relatedEntity is polymorphic
    })
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('createdBy', 'name email')
    .populate('account', 'accountNumber type') // Populate the account used for the transaction
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

  const loan = await Loan.findById(loanId); // Fetch loan to ensure it exists
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  const repayments = await Transaction.find({
    relatedEntity: loanId, // Link by relatedEntity
    relatedEntityType: 'Loan', // And relatedEntityType
    type: 'loan_repayment',
    deleted: false, // Exclude soft-deleted transactions
  })
    .populate('member', 'name email')
    .populate('group', 'name') // If group is relevant for the transaction
    .populate('createdBy', 'name email')
    .populate('account', 'accountNumber type') // Populate the account used for the transaction
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

  const query = {
    _id: id,
    type: 'loan_repayment',
    deleted: false,
    ...(req.dataFilter || {}),
  }; // Combine with filterDataByRole and ensure not deleted

  const repaymentTransaction = await Transaction.findOne(query)
    .populate({
      path: 'relatedEntity',
      select: 'amountApproved borrower borrowerModel status',
      model: 'Loan', // Specify model if relatedEntity is polymorphic
    })
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('createdBy', 'name email')
    .populate('account', 'accountNumber type'); // Populate the account used for the transaction

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

  // Start a Mongoose session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the original repayment, ensuring it's a loan_repayment and not already voided/deleted
    const originalRepayment = await Transaction.findOne({
      _id: id,
      type: 'loan_repayment',
      status: 'completed', // Only completed repayments can be voided
      deleted: false, // Ensure it's not already soft-deleted
    }).session(session);

    if (!originalRepayment) {
      throw new ErrorResponse(
        'Original completed repayment transaction not found or already voided/deleted.',
        404
      );
    }

    // 1. Mark the original repayment as voided (status change and soft delete)
    originalRepayment.status = 'voided';
    originalRepayment.deleted = true; // Mark as soft deleted
    originalRepayment.deletedAt = new Date();
    originalRepayment.voidedBy = req.user.id; // Record who voided it
    originalRepayment.voidReason = reason; // Record the reason
    await originalRepayment.save({ session });

    // 2. Reverse the financial impact on the borrower's account
    const loan = await Loan.findById(originalRepayment.relatedEntity).session(
      session
    ); // Use relatedEntity
    if (!loan) {
      throw new ErrorResponse(
        'Associated loan not found for original repayment.',
        404
      );
    }

    const borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      throw new ErrorResponse('Borrower account not found for reversal.', 404);
    }

    // Add the amount back to the borrower's account (reversal of a debit)
    const newBorrowerBalance =
      borrowerAccount.balance + originalRepayment.amount;
    borrowerAccount.balance = newBorrowerBalance;
    await borrowerAccount.save({ session });

    // 3. Create a new 'adjustment' or 'refund' transaction to record the reversal
    const reversalTransaction = await Transaction.create(
      [
        {
          type: 'loan_repayment_reversal', // More specific type for the reversal transaction
          member: originalRepayment.member,
          group: originalRepayment.group,
          account: borrowerAccount._id, // Link to the account that was affected
          amount: originalRepayment.amount, // Positive amount for the deposit back
          description: `Reversal of loan repayment ${originalRepayment._id} (Voided). Reason: ${reason}`,
          status: 'completed',
          balanceAfter: newBorrowerBalance,
          createdBy: req.user.id,
          relatedEntity: originalRepayment._id, // Link to the original repayment transaction
          relatedEntityType: 'Transaction',
          paymentMethod: originalRepayment.paymentMethod, // Inherit method from original, or new
          // You might also add a 'isReversal: true' field or similar for easier querying
        },
      ],
      { session }
    );

    // 4. Update the Loan's repayment schedule (mark affected installments as pending again)
    loan.amountRepaid = Math.max(
      0,
      (loan.amountRepaid || 0) - originalRepayment.amount
    );

    let amountToReverseFromInstallments = originalRepayment.amount;
    // Iterate through schedule in reverse to un-pay installments
    for (
      let i = loan.repaymentSchedule.length - 1;
      i >= 0 && amountToReverseFromInstallments > 0;
      i--
    ) {
      const installment = loan.repaymentSchedule[i];
      // Only affect paid installments or partially paid ones
      if (installment.amountPaid > 0) {
        // Check if any amount was paid towards this installment
        const amountToDeduct = Math.min(
          amountToReverseFromInstallments,
          installment.amountPaid
        );
        installment.amountPaid -= amountToDeduct;
        amountToReverseFromInstallments -= amountToDeduct;

        if (installment.amountPaid < installment.amount) {
          installment.status = 'pending'; // Revert to pending if not fully paid
          if (installment.amountPaid === 0) {
            installment.paidAt = undefined; // Clear paid date only if fully reset
          }
        }
      }
    }

    // Update loan status if it was completed but now has outstanding balance
    const newOutstandingBalance = loan.repaymentSchedule
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount - (r.amountPaid || 0)), 0);

    if (loan.status === 'completed' && newOutstandingBalance > 0) {
      loan.status = 'disbursed'; // Revert to 'disbursed' (or 'approved' based on your specific flow)
    }

    await loan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Repayment successfully voided and reversed.',
      originalRepayment, // Return the voided original
      reversalTransaction: reversalTransaction[0], // Return the new reversal transaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error voiding repayment:', error); // More specific error
    next(error);
  }
});
