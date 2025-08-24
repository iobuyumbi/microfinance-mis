// server\controllers\loanController.js
const Loan = require('../models/Loan');
const Group = require('../models/Group');
const User = require('../models/User');
const Account = require('../models/Account'); // For loan disbursement
const Transaction = require('../models/Transaction'); // For loan disbursement transaction

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse, withTransaction } = require('../utils'); // Import custom error class and transaction helper
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get currency from settings (async virtuals need this in controllers)
let appSettings = null;
const Constants = require('../utils/constants'); // Import constants

async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('../models/Settings').schema);
    appSettings = await Settings.findOne({ settingsId: 'app_settings' });
    if (!appSettings) {
      console.warn(`Settings document not found. Using default currency ${Constants.DEFAULT_CURRENCY}.`);
      appSettings = { general: { currency: Constants.DEFAULT_CURRENCY } }; // Fallback
    }
  }
  return appSettings.general.currency || Constants.FALLBACK_CURRENCY;
}

// Import financial utilities
const { calculateLoanSchedule } = require('../utils/financialUtils');

// Helper function to calculate repayment schedule (using the centralized utility)
const calculateRepaymentSchedule = (amount, interestRate, loanTermInMonths) => {
  return calculateLoanSchedule({
    amount,
    interestRate,
    loanTerm: loanTermInMonths,
  });
};

// @desc    Get loan statistics
// @route   GET /api/loans/stats
// @access  Private (filterDataByRole middleware handles access)
exports.getLoanStats = asyncHandler(async (req, res, next) => {
  const loanFilter = req.dataFilter || {};

  const [totalLoans, approvedLoans, pendingLoans, disbursedLoans, amountsAgg] =
    await Promise.all([
      Loan.countDocuments(loanFilter),
      Loan.countDocuments({
        status: { $in: ['approved', 'disbursed'] },
        ...loanFilter,
      }),
      Loan.countDocuments({ status: 'pending', ...loanFilter }),
      Loan.countDocuments({ status: 'disbursed', ...loanFilter }),
      Loan.aggregate([
        {
          $match: { ...loanFilter, status: { $in: ['approved', 'disbursed'] } },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $ifNull: ['$amountApproved', 0] } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  const totalAmount = amountsAgg[0]?.totalAmount || 0;
  const approvedCount = amountsAgg[0]?.count || 0;
  const averageLoanAmount = approvedCount > 0 ? totalAmount / approvedCount : 0;

  res.status(200).json({
    success: true,
    data: {
      totalLoans,
      totalAmount,
      approvedLoans,
      pendingLoans,
      disbursedLoans,
      averageLoanAmount,
    },
  });
});

// @desc    Apply for a loan
// @route   POST /api/loans
// @access  Private (Member for self, Leader for group members, Admin/Officer for any)
exports.applyForLoan = asyncHandler(async (req, res, next) => {
  const { borrower, borrowerModel, amountRequested, interestRate, loanTerm } =
    req.body;

  // 1. Basic Validation (already handled by validateRequiredFields in route, but good for type check)
  // No need to repeat !borrower || !borrowerModel || etc. checks here.
  if (!['User', 'Group'].includes(borrowerModel)) {
    return next(
      new ErrorResponse(
        'Invalid borrowerModel. Must be "User" or "Group".',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(borrower)) {
    return next(new ErrorResponse('Invalid Borrower ID format.', 400));
  }
  if (amountRequested <= 0 || loanTerm <= 0) {
    return next(
      new ErrorResponse('Amount requested and loan term must be positive.', 400)
    );
  }

  // 2. Verify Borrower Exists
  let actualBorrower;
  if (borrowerModel === 'User') {
    actualBorrower = await User.findById(borrower);
  } else {
    // 'Group'
    actualBorrower = await Group.findById(borrower);
  }
  if (!actualBorrower) {
    return next(new ErrorResponse(`${borrowerModel} not found.`, 404));
  }

  // 3. Access Control: This logic is now primarily handled by a combination of
  // the 'protect' middleware (ensuring authenticated user) and the 'filterDataByRole'
  // in the routes. For loan application, a simple check that `req.user` is
  // involved (as borrower or authorized to act for the group) is sufficient
  // as the controller does the validation.
  // The specific authorization middleware for 'applyForLoan' would need to be custom
  // if 'Member cannot apply for other Members' or 'Leader cannot apply for other Groups'.
  // For now, the existing pattern implies that an authenticated user can initiate a loan application
  // and the system will validate the `borrower` and `borrowerModel` fields.
  // The previous commented-out section for role-based access can be removed.
  // The crucial `filterDataByRole` later on will ensure only appropriate data is returned/modified.

  // 4. Create the loan application
  const loan = await Loan.create({
    borrower,
    borrowerModel,
    amountRequested,
    interestRate: interestRate || 0, // Default interest rate
    loanTerm,
    status: 'pending', // All new loans start as pending
    // approver will be set when approved
  });

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully.',
    data: loan,
  });
});

// @desc    Get all loans (system-wide or filtered by user/group)
// @route   GET /api/loans
// @access  Private (filterDataByRole middleware handles access)
exports.getAllLoans = asyncHandler(async (req, res, next) => {
  // const currency = await getCurrency(); // Not directly used here, but can be for formatting
  let query = req.dataFilter || {}; // Use filter from filterDataByRole middleware

  const loans = await Loan.find(query)
    .populate('borrower', 'name email') // Populate borrower details
    .populate('approver', 'name email') // Populate approver details
    .sort({ createdAt: -1 });

  // Await async virtuals for each loan
  const formattedLoans = await Promise.all(
    loans.map(async loan => {
      const obj = loan.toObject({ virtuals: true });
      obj.formattedAmountRequested = await loan.formattedAmountRequested;
      obj.formattedAmountApproved = await loan.formattedAmountApproved;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedLoans.length,
    data: formattedLoans,
  });
});

// @desc    Get a single loan by ID with access control
// @route   GET /api/loans/:id
// @access  Private (filterDataByRole middleware handles access)
exports.getLoanById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }
  // const currency = await getCurrency(); // Not directly used here

  let query = { _id: id };
  // Apply data filter from middleware (if any)
  // This is crucial for ensuring users only see loans they are authorized for.
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const loan = await Loan.findOne(query)
    .populate('borrower', 'name email')
    .populate('approver', 'name email');

  if (!loan) {
    // If not found, it means either the ID is wrong, or the user doesn't have access based on req.dataFilter
    return next(
      new ErrorResponse('Loan not found or you do not have access.', 404)
    );
  }

  // Await async virtuals
  const formattedLoan = loan.toObject({ virtuals: true });
  formattedLoan.formattedAmountRequested = await loan.formattedAmountRequested;
  formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

  res.status(200).json({
    success: true,
    data: formattedLoan,
  });
});

// @desc    Approve or update loan status/schedule
// @route   PUT /api/loans/:id/approve
// @access  Private (Admin, Officer)
exports.approveLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, amountApproved, repaymentSchedule, disbursementMethod } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

  // For approveLoan, since the route is authorized only for 'admin' and 'officer',
  // we can use findById directly, as these roles typically have broader access.
  const loan = await Loan.findById(id);
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // Only allow approval if loan is pending
  if (loan.status !== 'pending') {
    return next(
      new ErrorResponse(
        `Loan is not in 'pending' status. Current status: ${loan.status}.`,
        400
      )
    );
  }

  // Ensure amountApproved is provided if status is 'approved'
  if (
    status === 'approved' &&
    (amountApproved === undefined || amountApproved <= 0)
  ) {
    return next(
      new ErrorResponse(
        'Amount approved must be provided and positive when approving a loan.',
        400
      )
    );
  }

  // Store disbursement method if provided
  if (status === 'approved' && disbursementMethod) {
    loan.disbursementMethod = disbursementMethod;
  }

  // Update loan details
  loan.status = status || loan.status; // Allow status update
  loan.approver = req.user._id; // Set the approver

  let finalRepaymentSchedule = repaymentSchedule;

  if (loan.status === 'approved') {
    loan.amountApproved = amountApproved;
    // If no repayment schedule is provided, generate one
    if (!finalRepaymentSchedule || finalRepaymentSchedule.length === 0) {
      finalRepaymentSchedule = calculateRepaymentSchedule(
        loan.amountApproved,
        loan.interestRate,
        loan.loanTerm
      );
    }
    loan.repaymentSchedule = finalRepaymentSchedule;
  } else if (loan.status === 'rejected') {
    // If rejected, ensure amountApproved is null/0 and repaymentSchedule is empty
    loan.amountApproved = 0;
    loan.repaymentSchedule = [];
  }

  await loan.save();

  // Populate for response
  await loan.populate('borrower', 'name email');
  await loan.populate('approver', 'name email');

  // Await async virtuals
  const formattedLoan = loan.toObject({ virtuals: true });
  formattedLoan.formattedAmountRequested = await loan.formattedAmountRequested;
  formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

  res.status(200).json({
    success: true,
    message: `Loan status updated to '${loan.status}'.`,
    data: formattedLoan,
  });
});

// @desc    Disburse an approved loan
// @route   POST /api/loans/:id/disburse
// @access  Private (Admin, Officer)
exports.disburseLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { disbursementMethod = 'mobile' } = req.body; // Default to mobile if not specified

  // Validate loan ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid loan ID format.', 400));
  }

  // Find the loan with borrower details
  const loan = await Loan.findById(id)
    .populate({
      path: 'borrower',
      select: 'name email',
    })
    .populate('approver', 'name email');

  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // Check if loan is approved
  if (loan.status !== 'approved') {
    return next(
      new ErrorResponse(
        `Loan is not approved. Current status: ${loan.status}.`,
        400
      )
    );
  }

  // Check if loan has already been disbursed
  if (loan.status === 'disbursed') {
    return next(new ErrorResponse('Loan has already been disbursed.', 400));
  }

  // Import financial utilities
  const { processLoanDisbursement } = require('../utils/financialUtils');

  try {
    // Run account update, transaction creation, and loan status update atomically
    const { transaction, account } = await withTransaction(async session => {
      const result = await processLoanDisbursement(loan, req.user.id, {
        disbursementMethod,
        session,
      });

      // Update loan status to disbursed within the same session
      loan.status = 'disbursed';
      loan.disbursedAt = new Date();
      loan.disbursedBy = req.user.id;
      loan.disbursementMethod = disbursementMethod;
      await loan.save({ session });

      return { transaction: result.transaction, account: result.account };
    });

    // Populate for response
    await loan.populate('borrower', 'name email');
    await loan.populate('approver', 'name email');
    await loan.populate('disbursedBy', 'name email');

    // Await async virtuals
    const formattedLoan = loan.toObject({ virtuals: true });
    formattedLoan.formattedAmountRequested =
      await loan.formattedAmountRequested;
    formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

    res.status(200).json({
      success: true,
      message: 'Loan disbursed successfully.',
      data: {
        loan: formattedLoan,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          receiptNumber: transaction.receiptNumber,
        },
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          newBalance: account.balance,
        },
      },
    });
  } catch (error) {
    console.error('Error disbursing loan:', error);
    return next(
      new ErrorResponse(`Failed to disburse loan: ${error.message}`, 500)
    );
  }
});

// @desc    Process loan repayment
// @route   POST /api/loans/:id/repay
// @access  Private (Admin, Officer, Member)
exports.repayLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { amount, paymentMethod = 'mobile', installmentId } = req.body;

  // Import financial utilities
  const { createFinancialTransaction } = require('../utils/financialUtils');

  // Validate loan ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid loan ID format.', 400));
  }

  // Validate amount
  if (!amount || amount <= 0) {
    return next(
      new ErrorResponse('Please provide a valid payment amount.', 400)
    );
  }

  // Find the loan with borrower details
  const loan = await Loan.findById(id).populate({
    path: 'borrower',
    select: 'name email _id',
  });

  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // Check if loan is in a status that allows repayment
  if (loan.status !== 'disbursed' && loan.status !== 'partially_paid') {
    return next(
      new ErrorResponse(
        `Loan cannot be repaid. Current status: ${loan.status}`,
        400
      )
    );
  }

  // Find the group account if this is a group loan
  let account;
  const borrowerType = loan.borrowerModel.toLowerCase();

  try {
    if (borrowerType === 'group') {
      const group = await Group.findById(loan.borrower._id).populate('account');
      if (!group) {
        return next(new ErrorResponse('Group not found', 404));
      }
      account = group.account;
    } else {
      // For individual loans, find the user's personal account
      const user = await User.findById(loan.borrower._id);
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }
      // Find the user's personal account
      account = await Account.findOne({
        owner: user._id,
        ownerModel: 'User',
        type: 'savings',
      });
    }

    if (!account) {
      return next(
        new ErrorResponse(`No account found for the ${borrowerType}`, 404)
      );
    }

    // Start a database session for transaction atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the specific installment if provided
      let installmentToUpdate = null;
      if (installmentId && mongoose.Types.ObjectId.isValid(installmentId)) {
        // Find the specific installment in the repayment schedule
        installmentToUpdate = loan.repaymentSchedule.id(installmentId);
        if (!installmentToUpdate) {
          await session.abortTransaction();
          session.endSession();
          return next(new ErrorResponse('Installment not found.', 404));
        }
      }

      // Create a loan repayment transaction
      const transactionResult = await createFinancialTransaction({
        type: 'loan_repayment',
        amount: amount,
        account: account._id,
        description: `Loan repayment for ${loan.borrowerModel} ${loan.borrower.name}${installmentToUpdate ? ' - Installment ' + installmentToUpdate.installmentNumber : ''}`,
        relatedEntity: {
          model: 'Loan',
          id: loan._id,
        },
        paymentMethod,
        createdBy: req.user._id,
        session,
      });

      // Update the loan installment if specified
      if (installmentToUpdate) {
        const remainingAmount = installmentToUpdate.amount - amount;

        if (remainingAmount <= 0) {
          // Mark installment as paid
          installmentToUpdate.status = 'paid';
          installmentToUpdate.paidAmount = installmentToUpdate.amount;
          installmentToUpdate.paidDate = new Date();
          installmentToUpdate.transaction = transactionResult.transaction._id;
        } else {
          // Mark installment as partially paid
          installmentToUpdate.status = 'partially_paid';
          installmentToUpdate.paidAmount =
            (installmentToUpdate.paidAmount || 0) + amount;
          installmentToUpdate.lastPaymentDate = new Date();
          installmentToUpdate.transactions =
            installmentToUpdate.transactions || [];
          installmentToUpdate.transactions.push(
            transactionResult.transaction._id
          );
        }
      } else {
        // If no specific installment, apply payment to the earliest unpaid installment
        let remainingPayment = amount;
        for (const installment of loan.repaymentSchedule) {
          if (installment.status !== 'paid' && remainingPayment > 0) {
            const installmentRemaining =
              installment.amount - (installment.paidAmount || 0);
            const paymentForThisInstallment = Math.min(
              remainingPayment,
              installmentRemaining
            );

            installment.paidAmount =
              (installment.paidAmount || 0) + paymentForThisInstallment;
            installment.transactions = installment.transactions || [];
            installment.transactions.push(transactionResult.transaction._id);

            if (installment.paidAmount >= installment.amount) {
              installment.status = 'paid';
              installment.paidDate = new Date();
            } else {
              installment.status = 'partially_paid';
              installment.lastPaymentDate = new Date();
            }

            remainingPayment -= paymentForThisInstallment;
          }
        }
      }

      // Update loan status based on repayment schedule
      const allPaid = loan.repaymentSchedule.every(
        installment => installment.status === 'paid'
      );
      const anyPaid = loan.repaymentSchedule.some(
        installment =>
          installment.status === 'paid' ||
          installment.status === 'partially_paid'
      );

      if (allPaid) {
        loan.status = 'paid';
      } else if (anyPaid) {
        loan.status = 'partially_paid';
      }

      // Save the updated loan
      await loan.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        data: {
          loan,
          transaction: transactionResult.transaction,
        },
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      return next(
        new ErrorResponse(
          `Failed to process loan repayment: ${error.message}`,
          500
        )
      );
    }
  } catch (error) {
    return next(
      new ErrorResponse(`Error finding account: ${error.message}`, 500)
    );
  }
});

// @desc    Update loan request (only pending + access-controlled)
// @route   PUT /api/loans/:id
// @access  Private (Borrower or Admin/Officer) - filterDataByRole middleware handles this
exports.updateLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const loan = await Loan.findOne(query);

  if (!loan) {
    // If not found, it means either the ID is wrong, or the user doesn't have access
    return next(
      new ErrorResponse(
        'Loan not found or you do not have access to update.',
        404
      )
    );
  }

  // Only pending loans can be updated
  if (loan.status !== 'pending') {
    return next(
      new ErrorResponse('Only pending loan applications can be updated.', 400)
    );
  }

  // Fields allowed for update by borrower/admin/officer for a pending loan
  const allowedUpdates = ['amountRequested', 'interestRate', 'loanTerm'];
  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Apply updates
  Object.assign(loan, updates);
  await loan.save();

  // Populate for response
  await loan.populate('borrower', 'name email');
  await loan.populate('approver', 'name email');

  // Await async virtuals
  const formattedLoan = loan.toObject({ virtuals: true });
  formattedLoan.formattedAmountRequested = await loan.formattedAmountRequested;
  formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

  res.status(200).json({
    success: true,
    message: 'Loan application updated successfully.',
    data: formattedLoan,
  });
});

// @desc    Delete a loan (soft delete recommended for financial records)
// @route   DELETE /api/loans/:id
// @access  Private (Admin, Officer, or loan creator if pending - via filterDataByRole/authorize)
exports.deleteLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

  // For delete, the route uses authorize('admin', 'officer').
  // So, findById is acceptable as these roles have broad permission.
  const loan = await Loan.findById(id);
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // IMPORTANT: For financial records, hard deleting is generally discouraged.
  // Consider soft deleting (e.g., setting a 'status: "cancelled"' or 'deleted: true')
  // especially if the loan was ever approved or had transactions.

  // If loan is approved/completed, prevent direct deletion
  if (
    loan.status === 'approved' ||
    loan.status === 'completed' ||
    loan.status === 'overdue'
  ) {
    return next(
      new ErrorResponse(
        'Cannot directly delete an active or completed loan. Please cancel or adjust its status.',
        400
      )
    );
  }

  // Perform hard delete only if pending and no financial impact
  await loan.deleteOne(); // Mongoose 6+ uses deleteOne()

  res.status(200).json({
    success: true,
    message: 'Loan application deleted successfully.',
    data: {},
  });
});
