const Loan = require('../models/Loan');
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { ErrorResponse } = require('../utils/errorResponse');
const mongoose = require('mongoose');

class LoanService {
  /**
   * Calculate repayment schedule for a loan
   * @param {number} amount - Loan amount
   * @param {number} interestRate - Interest rate percentage
   * @param {number} loanTermInMonths - Loan term in months
   * @returns {Array} Repayment schedule
   */
  calculateRepaymentSchedule(amount, interestRate, loanTermInMonths) {
    if (loanTermInMonths <= 0) {
      return [
        {
          dueDate: new Date(),
          amount: parseFloat((amount * (1 + interestRate / 100)).toFixed(2)),
          status: 'pending',
        },
      ];
    }

    const totalAmountToRepay = amount * (1 + interestRate / 100);
    const monthlyPayment = totalAmountToRepay / loanTermInMonths;
    const schedule = [];
    let currentDate = new Date();

    for (let i = 0; i < loanTermInMonths; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        dueDate: new Date(currentDate),
        amount: parseFloat(monthlyPayment.toFixed(2)),
        status: 'pending',
      });
    }

    return schedule;
  }

  /**
   * Validate loan application data
   * @param {Object} loanData - Loan application data
   * @throws {ErrorResponse} If validation fails
   */
  validateLoanApplication(loanData) {
    const { borrower, borrowerModel, amountRequested, interestRate, loanTerm } =
      loanData;

    if (!['User', 'Group'].includes(borrowerModel)) {
      throw new ErrorResponse(
        'Invalid borrowerModel. Must be "User" or "Group".',
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(borrower)) {
      throw new ErrorResponse('Invalid Borrower ID format.', 400);
    }

    if (amountRequested <= 0 || loanTerm <= 0) {
      throw new ErrorResponse(
        'Amount requested and loan term must be positive.',
        400
      );
    }

    if (interestRate < 0) {
      throw new ErrorResponse('Interest rate cannot be negative.', 400);
    }
  }

  /**
   * Verify borrower exists and is valid
   * @param {string} borrowerId - Borrower ID
   * @param {string} borrowerModel - Borrower model type
   * @returns {Object} Borrower document
   * @throws {ErrorResponse} If borrower not found
   */
  async verifyBorrower(borrowerId, borrowerModel) {
    let borrower;

    if (borrowerModel === 'User') {
      borrower = await User.findById(borrowerId);
    } else {
      borrower = await Group.findById(borrowerId);
    }

    if (!borrower) {
      throw new ErrorResponse(`${borrowerModel} not found.`, 404);
    }

    return borrower;
  }

  /**
   * Create a new loan application
   * @param {Object} loanData - Loan application data
   * @param {string} createdBy - User ID who created the loan
   * @returns {Object} Created loan
   */
  async createLoanApplication(loanData, createdBy) {
    this.validateLoanApplication(loanData);
    await this.verifyBorrower(loanData.borrower, loanData.borrowerModel);

    const loan = await Loan.create({
      ...loanData,
      status: 'pending',
      createdBy,
    });

    return loan;
  }

  /**
   * Get loans with filtering and pagination
   * @param {Object} filter - Query filter
   * @param {Object} options - Query options
   * @returns {Object} Loans and count
   */
  async getLoans(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate = ['borrower', 'approver'],
    } = options;

    const skip = (page - 1) * limit;

    const [loans, total] = await Promise.all([
      Loan.find(filter).populate(populate).sort(sort).skip(skip).limit(limit),
      Loan.countDocuments(filter),
    ]);

    // Format loans with async virtuals
    const formattedLoans = await Promise.all(
      loans.map(async loan => {
        const obj = loan.toObject({ virtuals: true });
        obj.formattedAmountRequested = await loan.formattedAmountRequested;
        obj.formattedAmountApproved = await loan.formattedAmountApproved;
        return obj;
      })
    );

    return {
      loans: formattedLoans,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single loan by ID
   * @param {string} loanId - Loan ID
   * @param {Object} filter - Additional filter
   * @returns {Object} Loan document
   * @throws {ErrorResponse} If loan not found
   */
  async getLoanById(loanId, filter = {}) {
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      throw new ErrorResponse('Invalid Loan ID format.', 400);
    }

    const query = { _id: loanId, ...filter };
    const loan = await Loan.findOne(query)
      .populate('borrower', 'name email')
      .populate('approver', 'name email');

    if (!loan) {
      throw new ErrorResponse('Loan not found or you do not have access.', 404);
    }

    // Format loan with async virtuals
    const formattedLoan = loan.toObject({ virtuals: true });
    formattedLoan.formattedAmountRequested =
      await loan.formattedAmountRequested;
    formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

    return formattedLoan;
  }

  /**
   * Approve or reject a loan
   * @param {string} loanId - Loan ID
   * @param {Object} approvalData - Approval data
   * @param {string} approverId - Approver user ID
   * @returns {Object} Updated loan
   * @throws {ErrorResponse} If approval fails
   */
  async approveLoan(loanId, approvalData, approverId) {
    const { status, amountApproved, repaymentSchedule } = approvalData;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new ErrorResponse('Loan not found.', 404);
    }

    if (loan.status !== 'pending') {
      throw new ErrorResponse(
        `Loan is not in 'pending' status. Current status: ${loan.status}.`,
        400
      );
    }

    if (
      status === 'approved' &&
      (amountApproved === undefined || amountApproved <= 0)
    ) {
      throw new ErrorResponse(
        'Amount approved must be provided and positive when approving a loan.',
        400
      );
    }

    // Update loan details
    loan.status = status;
    loan.approver = approverId;

    if (status === 'approved') {
      loan.amountApproved = amountApproved;

      // Generate repayment schedule if not provided
      const finalRepaymentSchedule =
        repaymentSchedule ||
        this.calculateRepaymentSchedule(
          loan.amountApproved,
          loan.interestRate,
          loan.loanTerm
        );

      loan.repaymentSchedule = finalRepaymentSchedule;

      // Process loan disbursement
      await this.processLoanDisbursement(loan, approverId);
    } else if (status === 'rejected') {
      loan.amountApproved = 0;
      loan.repaymentSchedule = [];
    }

    await loan.save();

    // Populate and format response
    await loan.populate('borrower', 'name email');
    await loan.populate('approver', 'name email');

    const formattedLoan = loan.toObject({ virtuals: true });
    formattedLoan.formattedAmountRequested =
      await loan.formattedAmountRequested;
    formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

    return formattedLoan;
  }

  /**
   * Process loan disbursement
   * @param {Object} loan - Loan document
   * @param {string} approverId - Approver user ID
   * @private
   */
  async processLoanDisbursement(loan, approverId) {
    // Ensure atomic disbursement using a MongoDB session and centralized financial transaction utility
    const mongoose = require('mongoose');
    const {
      createFinancialTransaction,
    } = require('../../utils/financialUtils');

    const session = await mongoose.startSession();
    let borrowerAccount;

    try {
      await session.withTransaction(async () => {
        // Find or create borrower's savings account within the session
        borrowerAccount = await Account.findOne({
          owner: loan.borrower,
          ownerModel: loan.borrowerModel,
          type: 'savings',
          status: 'active',
        }).session(session);

        if (!borrowerAccount) {
          const created = await Account.create(
            [
              {
                owner: loan.borrower,
                ownerModel: loan.borrowerModel,
                type: 'savings',
                accountNumber: `SAV-${loan.borrower.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
                balance: 0,
                status: 'active',
              },
            ],
            { session }
          );
          borrowerAccount = created[0];
        }

        // Create the disbursement as a financial transaction (updates balance atomically)
        await createFinancialTransaction(
          {
            type: 'loan_disbursement',
            member: loan.borrowerModel === 'User' ? loan.borrower : null,
            group: loan.borrowerModel === 'Group' ? loan.borrower : null,
            account: borrowerAccount._id,
            amount: loan.amountApproved,
            description: `Loan disbursement for Loan ID: ${loan._id}`,
            status: 'completed',
            createdBy: approverId,
            relatedEntity: loan._id,
            relatedEntityType: 'Loan',
          },
          { session }
        );

        // Update group's total loans outstanding if applicable, within the same session
        if (loan.borrowerModel === 'Group') {
          const group = await Group.findById(loan.borrower).session(session);
          if (group) {
            group.totalLoansOutstanding =
              (group.totalLoansOutstanding || 0) + loan.amountApproved;
            await group.save({ session });
          }
        }
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Update loan application
   * @param {string} loanId - Loan ID
   * @param {Object} updateData - Update data
   * @param {Object} filter - Access filter
   * @returns {Object} Updated loan
   * @throws {ErrorResponse} If update fails
   */
  async updateLoan(loanId, updateData, filter = {}) {
    const query = { _id: loanId, ...filter };
    const loan = await Loan.findOne(query);

    if (!loan) {
      throw new ErrorResponse(
        'Loan not found or you do not have access to update.',
        404
      );
    }

    if (loan.status !== 'pending') {
      throw new ErrorResponse(
        'Only pending loan applications can be updated.',
        400
      );
    }

    // Fields allowed for update
    const allowedUpdates = ['amountRequested', 'interestRate', 'loanTerm'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    Object.assign(loan, updates);
    await loan.save();

    // Populate and format response
    await loan.populate('borrower', 'name email');
    await loan.populate('approver', 'name email');

    const formattedLoan = loan.toObject({ virtuals: true });
    formattedLoan.formattedAmountRequested =
      await loan.formattedAmountRequested;
    formattedLoan.formattedAmountApproved = await loan.formattedAmountApproved;

    return formattedLoan;
  }

  /**
   * Delete loan application
   * @param {string} loanId - Loan ID
   * @returns {Object} Deletion result
   * @throws {ErrorResponse} If deletion fails
   */
  async deleteLoan(loanId) {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new ErrorResponse('Loan not found.', 404);
    }

    if (['approved', 'completed', 'overdue'].includes(loan.status)) {
      throw new ErrorResponse(
        'Cannot directly delete an active or completed loan. Please cancel or adjust its status.',
        400
      );
    }

    await loan.deleteOne();
    return { success: true };
  }

  /**
   * Get loan statistics
   * @param {Object} filter - Query filter
   * @returns {Object} Loan statistics
   */
  async getLoanStats(filter = {}) {
    const stats = await Loan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          totalAmount: { $sum: '$amountRequested' },
          totalApproved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$amountApproved', 0],
            },
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
          },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalLoans: 0,
        totalAmount: 0,
        totalApproved: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        overdueCount: 0,
      }
    );
  }
}

module.exports = new LoanService();
