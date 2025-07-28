const Loan = require("../models/Loan");
const Repayment = require("../models/Repayment");
const Group = require("../models/Group");
const User = require("../models/User");

// Get repayments due within the next 30 days
exports.upcomingRepayments = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(now.getDate() + 30);

    const repayments = await Repayment.find({
      paymentDate: { $gte: now, $lte: in30Days },
    }).populate("loan");

    res.status(200).json({
      success: true,
      count: repayments.length,
      data: repayments,
    });
  } catch (error) {
    next(error);
  }
};

// Get total amount disbursed for approved loans
exports.totalLoansDisbursed = async (req, res, next) => {
  try {
    const [result] = await Loan.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amountApproved" } } },
    ]);

    res.status(200).json({
      success: true,
      total: result?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Get total savings per group (admin/officer sees all, members see own groups)
exports.groupSavingsPerformance = async (req, res, next) => {
  try {
    const isStaff = ["admin", "officer"].includes(req.user.role);
    const query = isStaff ? {} : { members: req.user._id };

    const groups = await Group.find(query);

    const data = groups.map((group) => ({
      group: group.name,
      totalSavings: group.totalSavings,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// Get all loans with overdue (pending) repayments
exports.activeLoanDefaulters = async (req, res, next) => {
  try {
    const now = new Date();
    const overdueLoans = await Loan.find({
      repaymentSchedule: {
        $elemMatch: { dueDate: { $lt: now }, status: "pending" },
      },
    });

    res.status(200).json({
      success: true,
      count: overdueLoans.length,
      data: overdueLoans,
    });
  } catch (error) {
    next(error);
  }
};

// Get total repayments and penalties for a specific month/year
exports.financialSummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null;

    const matchExpr = month
      ? {
          $expr: {
            $and: [
              { $eq: [{ $year: "$paymentDate" }, year] },
              { $eq: [{ $month: "$paymentDate" }, month] },
            ],
          },
        }
      : {
          $expr: { $eq: [{ $year: "$paymentDate" }, year] },
        };

    const [summary] = await Repayment.aggregate([
      { $match: matchExpr },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: "$amountPaid" },
          totalPenalty: { $sum: "$penalty" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      year,
      month,
      totalPaid: summary?.totalPaid || 0,
      totalPenalty: summary?.totalPenalty || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get current date for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Apply role-based filtering
    let userFilter = {};
    let groupFilter = {};
    
    if (!['admin', 'officer'].includes(req.user.role)) {
      // For leaders and members, filter by their groups
      const Group = require('../models/Group');
      const userGroups = await Group.find({ members: req.user._id }).distinct('_id');
      groupFilter = { group: { $in: userGroups } };
      userFilter = { $or: [{ _id: req.user._id }, { 'groupRoles.groupId': { $in: userGroups } }] };
    }

    // Get basic counts with role-based filtering
    const [totalMembers, totalLoans, activeLoans, pendingLoans, overdueLoans] = await Promise.all([
      User.countDocuments({ role: 'member', ...userFilter }),
      Loan.countDocuments(groupFilter),
      Loan.countDocuments({ status: 'active', ...groupFilter }),
      Loan.countDocuments({ status: 'pending', ...groupFilter }),
      Loan.countDocuments({ status: 'overdue', ...groupFilter })
    ]);

    // Get total savings (sum of all approved loan amounts as a proxy)
    const savingsResult = await Loan.aggregate([
      { $match: { status: 'approved', ...groupFilter } },
      { $group: { _id: null, total: { $sum: '$amountApproved' } } }
    ]);
    const totalSavings = savingsResult[0]?.total || 0;

    // Get recent activity (recent loans and repayments)
    const recentLoans = await Loan.find({
      createdAt: { $gte: startOfMonth },
      ...groupFilter
    })
    .populate('borrower', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    const recentRepayments = await Repayment.find({
      createdAt: { $gte: startOfMonth }
    })
    .populate('loan')
    .sort({ createdAt: -1 })
    .limit(5);

    // Format recent activity
    const recentActivity = [
      ...recentLoans.map(loan => ({
        description: `New loan application from ${loan.borrower?.name || 'Unknown'}`,
        timestamp: loan.createdAt,
        type: 'loan',
        amount: loan.amountRequested
      })),
      ...recentRepayments.map(repayment => ({
        description: `Payment received for loan`,
        timestamp: repayment.createdAt,
        type: 'payment',
        amount: repayment.amountPaid
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Get upcoming payments (due in next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    const upcomingPayments = await Repayment.find({
      paymentDate: { $gte: now, $lte: thirtyDaysFromNow },
      status: 'pending'
    })
    .populate('loan')
    .populate('loan.borrower', 'name')
    .sort({ paymentDate: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMembers,
          totalLoans,
          totalSavings,
          activeLoans,
          pendingApplications: pendingLoans,
          overduePayments: overdueLoans
        },
        recentActivity,
        upcomingPayments: upcomingPayments.map(payment => ({
          memberName: payment.loan?.borrower?.name || 'Unknown',
          amount: payment.amountDue,
          dueDate: payment.paymentDate,
          status: payment.status,
          loanId: payment.loan?._id
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
};

// Get recent activity endpoint
exports.getRecentActivity = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Apply role-based filtering
    let groupFilter = {};
    if (!['admin', 'officer'].includes(req.user.role)) {
      const Group = require('../models/Group');
      const userGroups = await Group.find({ members: req.user._id }).distinct('_id');
      groupFilter = { group: { $in: userGroups } };
    }

    const recentLoans = await Loan.find({
      createdAt: { $gte: startOfMonth },
      ...groupFilter
    })
    .populate('borrower', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    const recentRepayments = await Repayment.find({
      createdAt: { $gte: startOfMonth }
    })
    .populate('loan')
    .sort({ createdAt: -1 })
    .limit(10);

    const recentActivity = [
      ...recentLoans.map(loan => ({
        description: `New loan application from ${loan.borrower?.name || 'Unknown'}`,
        timestamp: loan.createdAt,
        type: 'loan',
        amount: loan.amountRequested
      })),
      ...recentRepayments.map(repayment => ({
        description: `Payment received for loan`,
        timestamp: repayment.createdAt,
        type: 'payment',
        amount: repayment.amountPaid
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

    res.status(200).json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    next(error);
  }
};
