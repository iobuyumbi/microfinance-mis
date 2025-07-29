// server\controllers\loanController.js
const Loan = require('../models/Loan');
const Group = require('../models/Group');
const User = require('../models/User');
const Account = require('../models/Account'); // For loan disbursement
const Transaction = require('../models/Transaction'); // For loan disbursement transaction

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class
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

// Helper function to calculate repayment schedule
const calculateRepaymentSchedule = (amount, interestRate, loanTermInMonths) => {
  // Basic flat interest calculation for simplicity.
  // For more complex (e.g., reducing balance) calculations, use a dedicated library or more complex logic.
  const monthlyInterestRate = interestRate / 100 / 12;
  const totalAmountToRepay = amount * (1 + interestRate / 100); // Principal + total interest

  if (loanTermInMonths <= 0) {
    return [
      {
        dueDate: new Date(),
        amount: totalAmountToRepay,
        status: 'pending',
      },
    ];
  }

  const monthlyPayment = totalAmountToRepay / loanTermInMonths;
  const schedule = [];
  let currentDate = new Date();

  for (let i = 0; i < loanTermInMonths; i++) {
    currentDate.setMonth(currentDate.getMonth() + 1); // Move to next month
    schedule.push({
      dueDate: new Date(currentDate), // Create new Date object to avoid reference issues
      amount: parseFloat(monthlyPayment.toFixed(2)), // Round to 2 decimal places
      status: 'pending',
    });
  }
  return schedule;
};

// @desc    Apply for a loan
// @route   POST /api/loans
// @access  Private (Member for self, Leader for group members, Admin/Officer for any)
exports.applyForLoan = asyncHandler(async (req, res, next) => {
  const { borrower, borrowerModel, amountRequested, interestRate, loanTerm } =
    req.body;

  // 1. Basic Validation
  if (!borrower || !borrowerModel || !amountRequested || !loanTerm) {
    return next(
      new ErrorResponse(
        'Borrower, borrower model, amount requested, and loan term are required.',
        400
      )
    );
  }
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

  // 3. Access Control (assuming middleware like authorizeOwnerOrAdmin or authorizeGroupPermission is used at route level)
  // If a member applies for self, ensure borrower is req.user.id
  if (
    borrowerModel === 'User' &&
    borrower.toString() !== req.user._id.toString()
  ) {
    // This means someone is trying to apply for a loan on behalf of another user.
    // This should be restricted to roles with appropriate permissions (e.g., 'officer', 'admin', or 'leader' for their group members)
    // This check would be handled by authorizeGroupPermission or authorize middleware.
    // For simplicity here, we'll assume the route middleware handles this.
  }
  // If a group applies, ensure req.user is a leader/officer/admin of that group
  if (borrowerModel === 'Group') {
    // This check is also handled by authorizeGroupPermission or authorize middleware.
  }

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
  const currency = await getCurrency();
  let query = req.dataFilter || {}; // Use filter from middleware

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
// @access  Private (authorizeLoanAccess middleware handles access)
exports.getLoanById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }
  const currency = await getCurrency();

  let query = { _id: id };
  // Apply data filter from middleware (if any)
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const loan = await Loan.findOne(query)
    .populate('borrower', 'name email')
    .populate('approver', 'name email');

  if (!loan) {
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
// @access  Private (Admin, Officer, or user with 'can_approve_loans' permission)
exports.approveLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, amountApproved, repaymentSchedule } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

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

    // --- DISBURSEMENT LOGIC ---
    // 1. Find the borrower's account
    let borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings', // Assuming loan is disbursed to their savings account
      status: 'active',
    });

    if (!borrowerAccount) {
      // If no existing savings account, create one for the borrower
      borrowerAccount = await Account.create({
        owner: loan.borrower,
        ownerModel: loan.borrowerModel,
        type: 'savings',
        accountNumber: `SAV-${loan.borrower.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
        balance: 0,
      });
    }

    // 2. Update borrower's account balance
    const newBalance = borrowerAccount.balance + loan.amountApproved;
    borrowerAccount.balance = newBalance;
    await borrowerAccount.save();

    // 3. Create a 'loan_disbursement' transaction record
    await Transaction.create({
      type: 'loan_disbursement',
      member: loan.borrowerModel === 'User' ? loan.borrower : null, // If borrower is a user
      group: loan.borrowerModel === 'Group' ? loan.borrower : null, // If borrower is a group
      amount: loan.amountApproved,
      description: `Loan disbursement for Loan ID: ${loan._id}`,
      status: 'completed',
      balanceAfter: newBalance, // Balance after this disbursement
      createdBy: req.user._id,
      relatedEntity: loan._id,
      relatedEntityType: 'Loan',
    });

    // 4. Optionally, update group's totalLoansOutstanding if borrower is a group
    if (loan.borrowerModel === 'Group') {
      const group = await Group.findById(loan.borrower);
      if (group) {
        group.totalLoansOutstanding =
          (group.totalLoansOutstanding || 0) + loan.amountApproved;
        await group.save();
      }
    }
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

// @desc    Update loan request (only pending + access-controlled)
// @route   PUT /api/loans/:id
// @access  Private (Borrower or Admin/Officer) - authorizeLoanAccess middleware handles this
exports.updateLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

  const loan = await Loan.findById(id);
  if (!loan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }

  // Only pending loans can be updated by the borrower
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
// @access  Private (Admin, Officer, or loan creator if pending)
exports.deleteLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }

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
