
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Group = require('../models/Group');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { formatCurrency } = require('../utils/currencyUtils');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const { timeRange = 'month' } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Build query filters based on user role
  let groupFilter = {};
  if (userRole === 'leader') {
    const userGroups = await Group.find({ leader: userId });
    groupFilter = { group: { $in: userGroups.map(g => g._id) } };
  } else if (userRole === 'member') {
    const userGroups = await Group.find({ members: userId });
    groupFilter = { group: { $in: userGroups.map(g => g._id) } };
  }

  // Get basic counts
  const [totalMembers, totalGroups, totalLoans, totalSavings] = await Promise.all([
    User.countDocuments({ role: 'member', ...groupFilter }),
    Group.countDocuments(userRole === 'admin' || userRole === 'officer' ? {} : { $or: [{ leader: userId }, { members: userId }] }),
    Loan.countDocuments({ status: 'active', ...groupFilter }),
    Account.aggregate([
      { $match: { type: 'savings', ...groupFilter } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ])
  ]);

  // Get recent transactions
  const recentTransactions = await Transaction.find({
    createdAt: { $gte: startDate },
    ...groupFilter
  })
    .populate('member', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get loan status distribution
  const loanStatusData = await Loan.aggregate([
    { $match: groupFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const loanStatus = [
    { name: 'Active', value: 0, color: '#10B981' },
    { name: 'Pending', value: 0, color: '#F59E0B' },
    { name: 'Completed', value: 0, color: '#6366F1' },
    { name: 'Overdue', value: 0, color: '#EF4444' }
  ];

  loanStatusData.forEach(item => {
    const statusIndex = loanStatus.findIndex(s => s.name.toLowerCase() === item._id);
    if (statusIndex !== -1) {
      loanStatus[statusIndex].value = item.count;
    }
  });

  // Get monthly data for charts
  const monthlyData = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(now.getFullYear(), 0, 1) },
        ...groupFilter
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        loans: {
          $sum: {
            $cond: [{ $eq: ['$type', 'loan_disbursement'] }, '$amount', 0]
          }
        },
        savings: {
          $sum: {
            $cond: [{ $eq: ['$type', 'savings_deposit'] }, '$amount', 0]
          }
        },
        members: { $addToSet: '$member' }
      }
    },
    {
      $project: {
        month: '$_id',
        loans: 1,
        savings: 1,
        members: { $size: '$members' }
      }
    },
    { $sort: { month: 1 } }
  ]);

  // Format monthly data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyData = months.map((monthName, index) => {
    const monthData = monthlyData.find(m => m.month === index + 1);
    return {
      month: monthName,
      loans: monthData ? monthData.loans : 0,
      savings: monthData ? monthData.savings : 0,
      members: monthData ? monthData.members : 0
    };
  });

  // Get weekly transaction activity
  const weeklyData = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        ...groupFilter
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        transactions: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formattedWeeklyData = dayNames.map((day, index) => {
    const dayData = weeklyData.find(w => w._id === index + 1);
    return {
      day,
      transactions: dayData ? dayData.transactions : 0,
      amount: dayData ? dayData.amount : 0
    };
  });

  // Calculate performance metrics
  const totalLoanAmount = await Loan.aggregate([
    { $match: { status: 'active', ...groupFilter } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const repaidAmount = await Transaction.aggregate([
    {
      $match: {
        type: 'loan_repayment',
        createdAt: { $gte: startDate },
        ...groupFilter
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const expectedRepayment = totalLoanAmount[0]?.total || 0;
  const actualRepayment = repaidAmount[0]?.total || 0;
  const repaymentRate = expectedRepayment > 0 ? (actualRepayment / expectedRepayment) * 100 : 0;

  // Get alerts
  const alerts = [];
  
  // Check for overdue loans
  const overdueLoans = await Loan.countDocuments({
    status: 'overdue',
    ...groupFilter
  });
  
  if (overdueLoans > 0) {
    alerts.push({
      id: 1,
      type: 'warning',
      message: `${overdueLoans} loans are overdue`,
      action: 'View Details',
      timestamp: new Date().toISOString()
    });
  }

  // Check for upcoming meetings
  const upcomingMeetings = await Group.countDocuments({
    nextMeeting: { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
    ...(userRole === 'admin' || userRole === 'officer' ? {} : { $or: [{ leader: userId }, { members: userId }] })
  });

  if (upcomingMeetings > 0) {
    alerts.push({
      id: 2,
      type: 'info',
      message: 'Group meeting scheduled for tomorrow',
      action: 'View Calendar',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    success: true,
    data: {
      totalMembers,
      totalLoans,
      totalSavings: totalSavings[0]?.total || 0,
      totalGroups,
      recentTransactions: recentTransactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        member: t.member?.name || 'Unknown',
        date: t.createdAt,
        status: t.status || 'completed'
      })),
      loanStatus,
      monthlyData: formattedMonthlyData,
      weeklyData: formattedWeeklyData,
      alerts,
      performanceMetrics: {
        loanRepaymentRate: Math.round(repaymentRate * 100) / 100,
        memberGrowthRate: 8.3, // This would be calculated based on historical data
        savingsGrowthRate: 15.2, // This would be calculated based on historical data
        portfolioQuality: 96.1 // This would be calculated based on loan performance
      }
    }
  });
});

// @desc    Get real-time metrics
// @route   GET /api/dashboard/metrics
// @access  Private
const getRealTimeMetrics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Build query filters based on user role
  let groupFilter = {};
  if (userRole === 'leader') {
    const userGroups = await Group.find({ leader: userId });
    groupFilter = { group: { $in: userGroups.map(g => g._id) } };
  } else if (userRole === 'member') {
    const userGroups = await Group.find({ members: userId });
    groupFilter = { group: { $in: userGroups.map(g => g._id) } };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayTransactions, pendingLoans, activeMembers] = await Promise.all([
    Transaction.countDocuments({
      createdAt: { $gte: today },
      ...groupFilter
    }),
    Loan.countDocuments({
      status: 'pending',
      ...groupFilter
    }),
    User.countDocuments({
      role: 'member',
      status: 'active',
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      ...groupFilter
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      todayTransactions,
      pendingLoans,
      activeMembers,
      timestamp: new Date().toISOString()
    }
  });
});

// @desc    Export dashboard data
// @route   GET /api/dashboard/export
// @access  Private
const exportDashboardData = asyncHandler(async (req, res) => {
  const { format = 'csv', timeRange = 'month' } = req.query;
  
  // This would generate and return exported data
  // For now, just return a success message
  res.status(200).json({
    success: true,
    message: 'Export functionality would be implemented here',
    data: {
      format,
      timeRange,
      downloadUrl: '/downloads/dashboard-export.csv'
    }
  });
});

module.exports = {
  getDashboardStats,
  getRealTimeMetrics,
  exportDashboardData
};
