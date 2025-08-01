const asyncHandler = require('../middleware/asyncHandler');
const loanService = require('../services/loan.service');
const { ErrorResponse } = require('../utils/errorResponse');

/**
 * @desc    Apply for a loan
 * @route   POST /api/loans
 * @access  Private (Member for self, Leader for group members, Admin/Officer for any)
 */
exports.applyForLoan = asyncHandler(async (req, res, next) => {
  const loanData = {
    borrower: req.body.borrower,
    borrowerModel: req.body.borrowerModel,
    amountRequested: req.body.amountRequested,
    interestRate: req.body.interestRate || 0,
    loanTerm: req.body.loanTerm,
  };

  const loan = await loanService.createLoanApplication(loanData, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully.',
    data: loan,
  });
});

/**
 * @desc    Get all loans (system-wide or filtered by user/group)
 * @route   GET /api/loans
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.getAllLoans = asyncHandler(async (req, res, next) => {
  const filter = req.dataFilter || {};
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sort: req.query.sort ? JSON.parse(req.query.sort) : { createdAt: -1 },
  };

  const result = await loanService.getLoans(filter, options);

  res.status(200).json({
    success: true,
    data: result.loans,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  });
});

/**
 * @desc    Get a single loan by ID with access control
 * @route   GET /api/loans/:id
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.getLoanById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.dataFilter || {};

  const loan = await loanService.getLoanById(id, filter);

  res.status(200).json({
    success: true,
    data: loan,
  });
});

/**
 * @desc    Approve or update loan status/schedule
 * @route   PUT /api/loans/:id/approve
 * @access  Private (Admin, Officer)
 */
exports.approveLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const approvalData = {
    status: req.body.status,
    amountApproved: req.body.amountApproved,
    repaymentSchedule: req.body.repaymentSchedule,
  };

  const loan = await loanService.approveLoan(id, approvalData, req.user._id);

  res.status(200).json({
    success: true,
    message: `Loan status updated to '${loan.status}'.`,
    data: loan,
  });
});

/**
 * @desc    Update loan request (only pending + access-controlled)
 * @route   PUT /api/loans/:id
 * @access  Private (Borrower or Admin/Officer) - filterDataByRole middleware handles this
 */
exports.updateLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.dataFilter || {};

  const loan = await loanService.updateLoan(id, req.body, filter);

  res.status(200).json({
    success: true,
    message: 'Loan application updated successfully.',
    data: loan,
  });
});

/**
 * @desc    Delete a loan (soft delete recommended for financial records)
 * @route   DELETE /api/loans/:id
 * @access  Private (Admin, Officer, or loan creator if pending - via filterDataByRole/authorize)
 */
exports.deleteLoan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await loanService.deleteLoan(id);

  res.status(200).json({
    success: true,
    message: 'Loan application deleted successfully.',
    data: {},
  });
});

/**
 * @desc    Get loan statistics
 * @route   GET /api/loans/stats
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.getLoanStats = asyncHandler(async (req, res, next) => {
  const filter = req.dataFilter || {};

  const stats = await loanService.getLoanStats(filter);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

/**
 * @desc    Get repayment schedule for a loan
 * @route   GET /api/loans/:id/repayment-schedule
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.getRepaymentSchedule = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.dataFilter || {};

  const loan = await loanService.getLoanById(id, filter);

  if (!loan.repaymentSchedule || loan.repaymentSchedule.length === 0) {
    throw new ErrorResponse('No repayment schedule found for this loan.', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      loanId: loan._id,
      totalAmount: loan.amountApproved,
      interestRate: loan.interestRate,
      loanTerm: loan.loanTerm,
      schedule: loan.repaymentSchedule,
    },
  });
});

/**
 * @desc    Add payment to loan
 * @route   POST /api/loans/:id/payments
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.addPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { amount, paymentDate, description } = req.body;

  if (!amount || amount <= 0) {
    throw new ErrorResponse('Payment amount must be positive.', 400);
  }

  const filter = req.dataFilter || {};
  const loan = await loanService.getLoanById(id, filter);

  if (loan.status !== 'approved') {
    throw new ErrorResponse(
      'Payments can only be made on approved loans.',
      400
    );
  }

  // TODO: Implement payment logic in loan service
  // This would involve:
  // 1. Creating a payment record
  // 2. Updating the repayment schedule
  // 3. Creating a transaction record
  // 4. Updating loan status if fully paid

  res.status(200).json({
    success: true,
    message: 'Payment added successfully.',
    data: {
      loanId: loan._id,
      paymentAmount: amount,
      paymentDate: paymentDate || new Date(),
    },
  });
});

/**
 * @desc    Get loan payments
 * @route   GET /api/loans/:id/payments
 * @access  Private (filterDataByRole middleware handles access)
 */
exports.getPayments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const filter = req.dataFilter || {};

  const loan = await loanService.getLoanById(id, filter);

  // TODO: Implement payment retrieval logic
  // This would involve fetching payment records from the database

  res.status(200).json({
    success: true,
    data: {
      loanId: loan._id,
      payments: [], // TODO: Fetch actual payments
      totalPaid: 0, // TODO: Calculate total paid
      remainingBalance: loan.amountApproved, // TODO: Calculate remaining balance
    },
  });
});
