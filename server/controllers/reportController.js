const Loan = require("../models/loanModel");
const Repayment = require("../models/repaymentModel");
const Group = require("../models/groupModel");

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
