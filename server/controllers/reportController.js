// server\controllers\reportController.js (REVISED)
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction'); // Used for all financial movements including repayments
const Account = require('../models/Account'); // For savings balances
const Group = require('../models/Group');
const User = require('../models/User'); // For member counts
const UserGroupMembership = require('../models/UserGroupMembership'); // To get user's accessible groups

const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse, settingsHelper } = require('../utils');
const mongoose = require('mongoose'); // For ObjectId validation

// @desc    Get repayments due within a specified period (default next 30 days)
// @route   GET /api/reports/upcoming-repayments
// @access  Private (filterDataByRole applies loan access)
exports.upcomingRepayments = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query; // Optional query parameters
  const currency = await settingsHelper.getCurrency();

  const now = new Date();
  const startFilterDate = startDate ? new Date(startDate) : now;
  const endFilterDate = endDate
    ? new Date(endDate)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30); // Default to next 30 days

  if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
    return next(
      new ErrorResponse('Invalid date format for startDate or endDate.', 400)
    );
  }

  // Prepare loan query based on req.dataFilter from middleware
  // req.dataFilter will be an object like { _id: { $in: [...] }} for specific loans,
  // or { borrower: { $in: [...] }, borrowerModel: 'User' } etc.
  // It's crucial that filterDataByRole for 'Loan' populates req.dataFilter appropriately.
  let loanFilter = req.dataFilter || {};

  const loans = await Loan.find({
    ...loanFilter, // Apply the data filter for loans
    status: { $in: ['approved', 'overdue', 'disbursed'] }, // Only consider active, overdue, or disbursed loans
    // The `$expr` check is typically not needed if you filter by pending installments on client-side
    // or if you always want to iterate to find pending ones. Removed for simplicity.
  })
    .populate('borrower', 'name email')
    .lean(); // Use lean() for performance with iteration

  let upcomingInstallments = [];

  loans.forEach(loan => {
    const currentCurrency = loan.currency || currency; // Use loan's currency or default
    loan.repaymentSchedule.forEach(installment => {
      if (
        installment.status === 'pending' &&
        installment.dueDate >= startFilterDate &&
        installment.dueDate <= endFilterDate
      ) {
        upcomingInstallments.push({
          loanId: loan._id,
          borrower: {
            _id: loan.borrower._id,
            name: loan.borrower.name,
            email: loan.borrower.email,
          },
          dueDate: installment.dueDate,
          amountDue: installment.amount,
          currency: currentCurrency,
          formattedAmountDue: `${currentCurrency} ${installment.amount.toFixed(2)}`,
          loanTerm: loan.loanTerm, // Include loan term for context
          loanStatus: loan.status,
        });
      }
    });
  });

  // Sort by due date
  upcomingInstallments.sort((a, b) => a.dueDate - b.dueDate);

  res.status(200).json({
    success: true,
    count: upcomingInstallments.length,
    data: upcomingInstallments,
  });
});

// @desc    Get total amount disbursed for approved loans
// @route   GET /api/reports/total-loans-disbursed
// @access  Private (Admin, Officer, or filterDataByRole for loans)
exports.totalLoansDisbursed = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();

  // The filterDataByRole middleware provides the `req.dataFilter` for 'Loan' model
  const loanFilter = req.dataFilter || {};

  const [result] = await Loan.aggregate([
    { $match: { status: { $in: ['approved', 'disbursed'] }, ...loanFilter } }, // Include 'disbursed' status
    { $group: { _id: null, total: { $sum: '$amountApproved' } } },
  ]);

  res.status(200).json({
    success: true,
    total: result?.total || 0,
    formattedTotal: `${currency} ${(result?.total || 0).toFixed(2)}`,
  });
});

// @desc    Get total savings per group or for user's groups
// @route   GET /api/reports/group-savings-performance
// @access  Private (filterDataByRole for groups)
exports.groupSavingsPerformance = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();

  // req.dataFilter for 'Group' should provide either an empty object (for admin/officer)
  // or { _id: { $in: [...] }} for specific groups a leader/member belongs to.
  const groupFilter = req.dataFilter || {};

  const groups = await Group.find(groupFilter).lean(); // Filter groups first

  const data = await Promise.all(
    groups.map(async group => {
      // Find all active members in this specific group
      const groupMemberIds = await UserGroupMembership.find({
        group: group._id,
        status: 'active',
      }).distinct('user');

      // Sum individual members' savings accounts within the group, but only for members
      // that are actually part of the accessible group's members list.
      const memberSavings = await Account.aggregate([
        {
          $match: {
            ownerModel: 'User',
            type: 'savings',
            status: 'active',
            owner: { $in: groupMemberIds }, // Filter by members active in this specific group
          },
        },
        { $group: { _id: null, total: { $sum: '$balance' } } },
      ]);

      // Get group's own dedicated savings account if it exists (type 'group_savings')
      const groupSavingsAccount = await Account.findOne({
        owner: group._id,
        ownerModel: 'Group',
        type: 'group_savings', // Assuming groups can have their own savings account
        status: 'active',
      });

      const totalGroupSavings =
        (memberSavings[0]?.total || 0) + (groupSavingsAccount?.balance || 0);

      return {
        group: group.name,
        groupId: group._id,
        totalSavings: totalGroupSavings,
        formattedTotalSavings: `${currency} ${totalGroupSavings.toFixed(2)}`,
        memberCount: groupMemberIds.length, // Use actual active member count
      };
    })
  );

  res.status(200).json({ success: true, data });
});

// @desc    Get all loans with overdue (pending) repayments
// @route   GET /api/reports/active-loan-defaulters
// @access  Private (filterDataByRole applies loan access)
exports.activeLoanDefaulters = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();
  const now = new Date();

  // Prepare loan query based on req.dataFilter from middleware
  const loanFilter = req.dataFilter || {};

  const overdueLoans = await Loan.find({
    ...loanFilter, // Apply the data filter for loans
    status: { $in: ['approved', 'overdue', 'disbursed'] }, // Consider all active loan statuses
    repaymentSchedule: {
      $elemMatch: {
        dueDate: { $lt: now },
        status: 'pending',
      },
    },
  }).populate('borrower', 'name email');

  // Calculate actual overdue amount for each loan
  const formattedOverdueLoans = await Promise.all(
    overdueLoans.map(async loan => {
      const totalOverdueAmount = loan.repaymentSchedule
        .filter(item => item.dueDate < now && item.status === 'pending')
        .reduce((sum, item) => sum + item.amount, 0);

      const currentCurrency = loan.currency || currency; // Use loan's currency or default

      return {
        loanId: loan._id,
        borrower: {
          _id: loan.borrower._id,
          name: loan.borrower.name,
          email: loan.borrower.email,
        },
        loanStatus: loan.status,
        overdueAmount: totalOverdueAmount,
        formattedOverdueAmount: `${currentCurrency} ${totalOverdueAmount.toFixed(2)}`,
        loanTerm: loan.loanTerm,
        amountApproved: await loan.formattedAmountApproved, // Use virtual for formatting
      };
    })
  );

  res.status(200).json({
    success: true,
    count: formattedOverdueLoans.length,
    data: formattedOverdueLoans,
  });
});

// @desc    Get total repayments and penalties for a specific month/year
// @route   GET /api/reports/financial-summary
// @access  Private (Admin, Officer, or filterDataByRole for transactions)
exports.financialSummary = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const month = req.query.month ? parseInt(req.query.month) : null; // 1-12 for month

  if (
    isNaN(year) ||
    (month !== null && (isNaN(month) || month < 1 || month > 12))
  ) {
    return next(new ErrorResponse('Invalid year or month parameter.', 400));
  }

  // Base match for 'loan_repayment' transactions
  let matchExpr = {
    type: 'loan_repayment',
    status: 'completed',
    deleted: false,
  };

  // Apply date filtering
  const start = new Date(year, month ? month - 1 : 0, 1);
  const end = month
    ? new Date(year, month, 0, 23, 59, 59, 999)
    : new Date(year, 11, 31, 23, 59, 59, 999); // End of month or end of year
  matchExpr.paymentDate = { $gte: start, $lte: end }; // Assuming createdAt for transactions is paymentDate

  // Apply role-based filtering from middleware for 'Transaction' model
  // req.dataFilter for 'Transaction' should provide an $or query for member/group/loan access
  if (req.dataFilter) {
    Object.assign(matchExpr, req.dataFilter); // Merge the filter directly
  }

  const [summary] = await Transaction.aggregate([
    { $match: matchExpr },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amount' },
        totalPenalty: { $sum: '$penalty' },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    year,
    month: month || 'All',
    totalPaid: summary?.totalPaid || 0,
    formattedTotalPaid: `${currency} ${(summary?.totalPaid || 0).toFixed(2)}`,
    totalPenalty: summary?.totalPenalty || 0,
    formattedTotalPenalty: `${currency} ${(summary?.totalPenalty || 0).toFixed(2)}`,
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private (filterDataByRole applies relevant filters)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  // Filters derived from req.dataFilter middleware for different models
  const loanQueryFilter = req.dataFilter?.Loan || {};
  const transactionQueryFilter = req.dataFilter?.Transaction || {};
  const userQueryFilter = req.dataFilter?.User || {};
  const groupQueryFilter = req.dataFilter?.Group || {};

  try {
    const [
      totalMembers,
      totalGroups,
      totalLoans,
      approvedLoans,
      pendingLoans,
      disbursedLoans,
      totalSavingsResult,
      recentLoans,
      recentTransactions,
      overdueLoans,
      monthlyContributions,
      monthlyRepayments,
    ] = await Promise.all([
      // Total members
      User.countDocuments({ role: 'member', ...userQueryFilter }),

      // Total groups
      Group.countDocuments(groupQueryFilter),

      // Total loans
      Loan.countDocuments(loanQueryFilter),

      // Approved loans
      Loan.countDocuments({
        status: { $in: ['approved', 'disbursed'] },
        ...loanQueryFilter,
      }),

      // Pending loans
      Loan.countDocuments({ status: 'pending', ...loanQueryFilter }),

      // Disbursed loans
      Loan.countDocuments({ status: 'disbursed', ...loanQueryFilter }),

      // Calculate total savings from Account balances
      Account.aggregate([
        {
          $match: {
            status: 'active',
            type: 'savings',
            $or: [
              {
                ownerModel: 'User',
                owner: userQueryFilter._id
                  ? { $in: userQueryFilter._id }
                  : { $exists: true },
              },
              {
                ownerModel: 'Group',
                owner: groupQueryFilter._id
                  ? { $in: groupQueryFilter._id }
                  : { $exists: true },
              },
            ],
          },
        },
        { $group: { _id: null, total: { $sum: '$balance' } } },
      ]),

      // Recent loans (last 5)
      Loan.find({
        createdAt: { $gte: startOfMonth },
        ...loanQueryFilter,
      })
        .populate('borrower', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent transactions (last 10)
      Transaction.find({
        createdAt: { $gte: startOfMonth },
        ...transactionQueryFilter,
      })
        .populate('member', 'name')
        .populate('group', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Overdue loans
      Loan.find({
        ...loanQueryFilter,
        status: { $in: ['approved', 'disbursed'] },
        repaymentSchedule: {
          $elemMatch: {
            dueDate: { $lt: now },
            status: 'pending',
          },
        },
      })
        .populate('borrower', 'name')
        .lean(),

      // Monthly contributions
      Transaction.aggregate([
        {
          $match: {
            type: 'savings_contribution',
            createdAt: { $gte: startOfMonth },
            ...transactionQueryFilter,
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Monthly repayments
      Transaction.aggregate([
        {
          $match: {
            type: 'loan_repayment',
            createdAt: { $gte: startOfMonth },
            ...transactionQueryFilter,
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalSavings = totalSavingsResult[0]?.total || 0;
    const monthlyContributionsTotal = monthlyContributions[0]?.total || 0;
    const monthlyRepaymentsTotal = monthlyRepayments[0]?.total || 0;
    const overduePaymentsCount = overdueLoans.length;

    // Calculate overdue amount
    let totalOverdueAmount = 0;
    overdueLoans.forEach(loan => {
      const overdueInstallments =
        loan.repaymentSchedule?.filter(
          installment =>
            installment.dueDate < now && installment.status === 'pending'
        ) || [];
      totalOverdueAmount += overdueInstallments.reduce(
        (sum, installment) => sum + installment.amount,
        0
      );
    });

    // Format recent activities
    const recentActivities = recentTransactions.map(transaction => ({
      id: transaction._id,
      type: transaction.type,
      title: getTransactionTitle(transaction),
      description: transaction.description,
      amount: transaction.amount,
      member: transaction.member?.name,
      group: transaction.group?.name,
      createdBy: transaction.createdBy?.name,
      createdAt: transaction.createdAt,
    }));

    // Format upcoming payments
    const upcomingPayments = overdueLoans
      .map(loan => {
        const overdueInstallments =
          loan.repaymentSchedule?.filter(
            installment =>
              installment.dueDate < now && installment.status === 'pending'
          ) || [];

        return overdueInstallments.map(installment => ({
          loanId: loan._id,
          borrower: loan.borrower?.name,
          amount: installment.amount,
          dueDate: installment.dueDate,
          daysOverdue: Math.floor(
            (now - installment.dueDate) / (1000 * 60 * 60 * 24)
          ),
        }));
      })
      .flat()
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        // Basic counts
        totalMembers,
        totalGroups,
        totalLoans,
        approvedLoans,
        pendingLoans,
        disbursedLoans,
        totalSavings,
        overduePaymentsCount,
        totalOverdueAmount,

        // Monthly totals
        monthlyContributions: monthlyContributionsTotal,
        monthlyRepayments: monthlyRepaymentsTotal,

        // Recent data
        recentLoans: recentLoans.slice(0, 5),
        recentActivities: recentActivities.slice(0, 5),
        upcomingPayments,

        // Currency info
        currency,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return next(new ErrorResponse('Failed to get dashboard statistics', 500));
  }
});

// Helper function to generate transaction titles
function getTransactionTitle(transaction) {
  const titles = {
    savings_contribution: 'Savings Contribution',
    savings_withdrawal: 'Savings Withdrawal',
    loan_disbursement: 'Loan Disbursement',
    loan_repayment: 'Loan Repayment',
    interest_earned: 'Interest Earned',
    interest_charged: 'Interest Charged',
    penalty_incurred: 'Penalty Incurred',
    penalty_paid: 'Penalty Paid',
    fee_incurred: 'Fee Incurred',
    fee_paid: 'Fee Paid',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    refund: 'Refund',
    adjustment: 'Adjustment',
  };

  return titles[transaction.type] || transaction.type;
}

// @desc    Get recent activity endpoint
// @route   GET /api/reports/recent-activity
// @access  Private (filterDataByRole applies relevant filters)
exports.getRecentActivity = asyncHandler(async (req, res, next) => {
  const currency = await settingsHelper.getCurrency();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filters derived from req.dataFilter middleware
  const loanQueryFilter = req.dataFilter?.Loan || {};
  const transactionQueryFilter = req.dataFilter?.Transaction || {};

  const [
    recentLoans,
    recentRepayments,
    recentSavingsDeposits,
    recentWithdrawals,
  ] = await Promise.all([
    Loan.find({
      createdAt: { $gte: startOfMonth },
      ...loanQueryFilter, // Apply loan filter
    })
      .populate('borrower', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Transaction.find({
      type: 'loan_repayment',
      createdAt: { $gte: startOfMonth },
      ...transactionQueryFilter, // Apply transaction filter
    })
      .populate('loan', 'borrower borrowerModel')
      .populate('member', 'name')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Transaction.find({
      type: 'savings_contribution',
      createdAt: { $gte: startOfMonth },
      ...transactionQueryFilter, // Apply transaction filter
    })
      .populate('member', 'name')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Transaction.find({
      type: 'savings_withdrawal',
      createdAt: { $gte: startOfMonth },
      ...transactionQueryFilter, // Apply transaction filter
    })
      .populate('member', 'name')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const allActivity = [
    ...recentLoans.map(loan => ({
      description: `New loan application from ${loan.borrower?.name || 'Unknown'} for ${currency} ${loan.amountRequested.toFixed(2)}`,
      timestamp: loan.createdAt,
      type: 'loan_application',
      amount: loan.amountRequested,
      formattedAmount: `${currency} ${loan.amountRequested.toFixed(2)}`,
    })),
    ...recentRepayments.map(repayment => ({
      description: `Loan repayment of ${currency} ${repayment.amount.toFixed(2)} for loan by ${repayment.member?.name || repayment.group?.name || 'Unknown'}`,
      timestamp: repayment.createdAt,
      type: 'loan_repayment',
      amount: repayment.amount,
      formattedAmount: `${currency} ${repayment.amount.toFixed(2)}`,
    })),
    ...recentSavingsDeposits.map(deposit => ({
      description: `Savings deposit of ${currency} ${deposit.amount.toFixed(2)} by ${deposit.member?.name || deposit.group?.name || 'Unknown'}`,
      timestamp: deposit.createdAt,
      type: 'deposit',
      amount: deposit.amount,
      formattedAmount: `${currency} ${deposit.amount.toFixed(2)}`,
    })),
    ...recentWithdrawals.map(withdrawal => ({
      description: `Savings withdrawal of ${currency} ${withdrawal.amount.toFixed(2)} by ${withdrawal.member?.name || withdrawal.group?.name || 'Unknown'}`,
      timestamp: withdrawal.createdAt,
      type: 'withdrawal',
      amount: withdrawal.amount,
      formattedAmount: `${currency} ${withdrawal.amount.toFixed(2)}`,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);

  res.status(200).json({
    success: true,
    data: allActivity,
  });
});
