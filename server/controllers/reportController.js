// server\controllers\reportController.js
const Loan = require("../models/Loan");
const Transaction = require("../models/Transaction"); // Used for all financial movements including repayments
const Account = require("../models/Account"); // For savings balances
const Group = require("../models/Group");
const User = require("../models/User"); // For member counts

const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get currency from settings (async virtuals need this in controllers)
let appSettings = null;
async function getCurrency() {
    if (!appSettings) {
        const Settings = mongoose.models.Settings || mongoose.model('Settings', require('../models/Settings').schema);
        appSettings = await Settings.findById('app_settings');
        if (!appSettings) {
            console.warn("Settings document not found. Using default currency USD.");
            appSettings = { general: { currency: "USD" } }; // Fallback
        }
    }
    return appSettings.general.currency;
}

// @desc    Get repayments due within a specified period (default next 30 days)
// @route   GET /api/reports/upcoming-repayments
// @access  Private (filterDataByRole applies loan access)
exports.upcomingRepayments = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query; // Optional query parameters
    const currency = await getCurrency();

    const now = new Date();
    const startFilterDate = startDate ? new Date(startDate) : now;
    const endFilterDate = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30); // Default to next 30 days

    if (isNaN(startFilterDate.getTime()) || isNaN(endFilterDate.getTime())) {
        return next(new ErrorResponse('Invalid date format for startDate or endDate.', 400));
    }

    // Prepare loan query based on req.dataFilter from middleware
    let loanFilter = req.dataFilter || {}; // This will restrict loans to user's groups/self

    const loans = await Loan.find({
        ...loanFilter,
        status: { $in: ['approved', 'overdue'] }, // Only consider active or overdue loans
        // $expr: {
        //     $gt: [{ $size: { $filter: { input: "$repaymentSchedule", as: "item", cond: { $eq: ["$$item.status", "pending"] } } } }, 0]
        // } // Ensure there are pending repayments
    }).populate('borrower', 'name email').lean(); // Use lean() for aggregation performance

    let upcomingInstallments = [];

    loans.forEach(loan => {
        const currentCurrency = loan.currency || currency; // Use loan's currency or default
        loan.repaymentSchedule.forEach(installment => {
            if (installment.status === 'pending' &&
                installment.dueDate >= startFilterDate &&
                installment.dueDate <= endFilterDate) {
                upcomingInstallments.push({
                    loanId: loan._id,
                    borrower: {
                        _id: loan.borrower._id,
                        name: loan.borrower.name,
                        email: loan.borrower.email
                    },
                    dueDate: installment.dueDate,
                    amountDue: installment.amount,
                    currency: currentCurrency,
                    formattedAmountDue: `${currentCurrency} ${installment.amount.toFixed(2)}`,
                    loanTerm: loan.loanTerm, // Include loan term for context
                    loanStatus: loan.status
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
// @access  Private (Admin, Officer, or filterDataByRole for groups)
exports.totalLoansDisbursed = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();

    // The filterDataByRole middleware provides the `req.dataFilter`
    const loanFilter = req.dataFilter || {}; // This will restrict loans to user's groups/self

    const [result] = await Loan.aggregate([
        { $match: { status: "approved", ...loanFilter } },
        { $group: { _id: null, total: { $sum: "$amountApproved" } } },
    ]);

    res.status(200).json({
        success: true,
        total: result?.total || 0,
        formattedTotal: `${currency} ${(result?.total || 0).toFixed(2)}`
    });
});

// @desc    Get total savings per group or for user's groups
// @route   GET /api/reports/group-savings-performance
// @access  Private (filterDataByRole for groups)
exports.groupSavingsPerformance = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();
    const query = req.dataFilter?.group || {}; // Filter for groups from middleware

    const groups = await Group.find(query).lean(); // Use lean() for performance

    const data = await Promise.all(groups.map(async (group) => {
        // Sum individual members' savings accounts within the group
        const memberSavings = await Account.aggregate([
            {
                $match: {
                    ownerModel: 'User',
                    type: 'savings',
                    status: 'active',
                    owner: { $in: group.members } // Filter by members in this group
                }
            },
            { $group: { _id: null, total: { $sum: "$balance" } } }
        ]);

        // Get group's own dedicated savings account if it exists (type 'group_savings')
        const groupSavingsAccount = await Account.findOne({
            owner: group._id,
            ownerModel: 'Group',
            type: 'group_savings', // Assuming groups can have their own savings account
            status: 'active'
        });

        const totalGroupSavings = (memberSavings[0]?.total || 0) + (groupSavingsAccount?.balance || 0);

        return {
            group: group.name,
            groupId: group._id,
            totalSavings: totalGroupSavings,
            formattedTotalSavings: `${currency} ${totalGroupSavings.toFixed(2)}`,
            memberCount: group.members.length
        };
    }));

    res.status(200).json({ success: true, data });
});


// @desc    Get all loans with overdue (pending) repayments
// @route   GET /api/reports/active-loan-defaulters
// @access  Private (filterDataByRole applies loan access)
exports.activeLoanDefaulters = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();
    const now = new Date();

    // Prepare loan query based on req.dataFilter from middleware
    let loanFilter = req.dataFilter || {}; // This will restrict loans to user's groups/self

    const overdueLoans = await Loan.find({
        ...loanFilter,
        status: { $in: ['approved', 'overdue'] }, // Only consider active or overdue loans
        repaymentSchedule: {
            $elemMatch: {
                dueDate: { $lt: now },
                status: "pending"
            }
        }
    }).populate('borrower', 'name email');

    // Calculate actual overdue amount for each loan
    const formattedOverdueLoans = await Promise.all(overdueLoans.map(async (loan) => {
        const totalOverdueAmount = loan.repaymentSchedule
            .filter(item => item.dueDate < now && item.status === 'pending')
            .reduce((sum, item) => sum + item.amount, 0);

        const currentCurrency = loan.currency || currency; // Use loan's currency or default

        return {
            loanId: loan._id,
            borrower: {
                _id: loan.borrower._id,
                name: loan.borrower.name,
                email: loan.borrower.email
            },
            loanStatus: loan.status,
            overdueAmount: totalOverdueAmount,
            formattedOverdueAmount: `${currentCurrency} ${totalOverdueAmount.toFixed(2)}`,
            loanTerm: loan.loanTerm,
            amountApproved: await loan.formattedAmountApproved // Use virtual for formatting
        };
    }));

    res.status(200).json({
        success: true,
        count: formattedOverdueLoans.length,
        data: formattedOverdueLoans,
    });
});

// @desc    Get total repayments and penalties for a specific month/year
// @route   GET /api/reports/financial-summary
// @access  Private (Admin, Officer, or filterDataByRole for groups)
exports.financialSummary = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month) : null; // 1-12 for month

    if (isNaN(year) || (month !== null && (isNaN(month) || month < 1 || month > 12))) {
        return next(new ErrorResponse('Invalid year or month parameter.', 400));
    }

    // Base match for 'loan_repayment' transactions
    let matchExpr = { type: 'loan_repayment', status: 'completed', deleted: false };

    // Apply date filtering
    const start = new Date(year, month ? month - 1 : 0, 1);
    const end = month ? new Date(year, month, 0) : new Date(year, 11, 31, 23, 59, 59); // End of month or end of year
    matchExpr.createdAt = { $gte: start, $lte: end }; // Assuming createdAt for transactions is paymentDate

    // Apply role-based filtering from middleware
    if (req.dataFilter) {
        // If dataFilter contains group or member specific filters, merge them
        if (req.dataFilter.group) { // Filter for group-related transactions
            matchExpr.group = req.dataFilter.group;
        }
        if (req.dataFilter.member) { // Filter for member-related transactions
            matchExpr.member = req.dataFilter.member;
        }
        // Admin/Officer will have an empty req.dataFilter, so no additional match is applied.
    }

    const [summary] = await Transaction.aggregate([
        { $match: matchExpr },
        {
            $group: {
                _id: null,
                totalPaid: { $sum: "$amount" },
                totalPenalty: { $sum: "$penalty" },
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
// @route   GET /api/reports/dashboard-stats
// @access  Private (filterDataByRole applies relevant filters)
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Filters derived from req.dataFilter middleware
    let loanFilter = req.dataFilter || {};
    let transactionFilter = req.dataFilter || {};
    let userFilter = req.dataFilter?.member ? { _id: req.dataFilter.member.$in[0] } : {}; // If member filter, apply to User model
    let groupFilter = req.dataFilter?.group || {}; // If group filter, apply to Group model

    // Apply group filter to User model for member count
    if (groupFilter && groupFilter.$in && groupFilter.$in.length > 0) {
        // Find users who are members of any of the accessible groups
        const membersInAccessibleGroups = await User.find({
            'groupRoles.groupId': { $in: groupFilter.$in }
        }).distinct('_id');
        userFilter._id = { $in: membersInAccessibleGroups };
    }


    const [
        totalMembers,
        totalLoans,
        approvedLoans,
        pendingLoans,
        totalSavingsResult,
        recentLoans,
        recentRepayments,
    ] = await Promise.all([
        User.countDocuments({ role: 'member', ...userFilter }), // Count members based on group filter
        Loan.countDocuments(loanFilter),
        Loan.countDocuments({ status: 'approved', ...loanFilter }),
        Loan.countDocuments({ status: 'pending', ...loanFilter }),
        // Calculate total savings from Account balances (for users within accessible groups/self)
        Account.aggregate([
            {
                $match: {
                    ownerModel: 'User',
                    type: 'savings',
                    status: 'active',
                    // Apply user filter for accounts (derived from group access)
                    owner: userFilter._id ? userFilter._id : { $exists: true }
                }
            },
            { $group: { _id: null, total: { $sum: "$balance" } } }
        ]),
        Loan.find({
            createdAt: { $gte: startOfMonth },
            ...loanFilter
        })
            .populate('borrower', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        Transaction.find({
            type: 'loan_repayment',
            createdAt: { $gte: startOfMonth },
            ...transactionFilter // This filter should also apply to transaction.member/group
        })
            .populate('loan', 'borrower borrowerModel') // Populate loan to get borrower for display
            .populate('member', 'name') // Populate member directly if it's a user repayment
            .populate('group', 'name') // Populate group if it's a group repayment
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
    ]);

    const totalSavings = totalSavingsResult[0]?.total || 0;

    // Get overdue payments
    const overdueLoansRaw = await Loan.find({
        ...loanFilter,
        status: { $in: ['approved', 'overdue'] },
        repaymentSchedule: {
            $elemMatch: {
                dueDate: { $lt: now },
                status: "pending"
            }
        }
    }).populate('borrower', 'name').lean();

    const overduePaymentsCount = overdueLoansRaw.length;
    let totalOverdueAmount = 0;
    overdueLoansRaw.forEach(loan => {
        totalOverdueAmount += loan.repaymentSchedule
            .filter(item => item.dueDate < now && item.status === 'pending')
            .reduce((sum, item) => sum + item.amount, 0);
    });


    // Format recent activity
    const activity = [
        ...recentLoans.map(loan => ({
            description: `New loan application from ${loan.borrower?.name || 'Unknown'} for ${currency} ${loan.amountRequested.toFixed(2)}`,
            timestamp: loan.createdAt,
            type: 'loan_application',
        })),
        ...recentRepayments.map(repayment => ({
            description: `Payment received of ${currency} ${repayment.amount.toFixed(2)} for loan ${repayment.loan ? repayment.loan._id.toString().substring(0, 6) : 'Unknown'}`,
            timestamp: repayment.createdAt,
            type: 'loan_repayment',
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);


    // Get upcoming payments (due in next 30 days) from loan schedules
    const loansWithUpcomingPayments = await Loan.find({
        ...loanFilter,
        status: { $in: ['approved', 'overdue'] },
        repaymentSchedule: {
            $elemMatch: {
                dueDate: { $gte: now, $lte: thirtyDaysFromNow },
                status: 'pending'
            }
        }
    })
        .populate('borrower', 'name')
        .lean(); // Use lean() for performance

    let upcomingPaymentsList = [];
    loansWithUpcomingPayments.forEach(loan => {
        loan.repaymentSchedule.forEach(installment => {
            if (installment.status === 'pending' &&
                installment.dueDate >= now &&
                installment.dueDate <= thirtyDaysFromNow) {
                upcomingPaymentsList.push({
                    loanId: loan._id,
                    borrowerName: loan.borrower?.name || 'Unknown',
                    amount: installment.amount,
                    dueDate: installment.dueDate,
                    formattedAmount: `${loan.currency || currency} ${installment.amount.toFixed(2)}`
                });
            }
        });
    });
    upcomingPaymentsList.sort((a, b) => a.dueDate - b.dueDate).slice(0, 10); // Limit to 10 for dashboard

    res.status(200).json({
        success: true,
        data: {
            stats: {
                totalMembers,
                totalLoans: totalLoans,
                approvedLoans,
                pendingApplications: pendingLoans,
                totalSavings: totalSavings,
                formattedTotalSavings: `${currency} ${totalSavings.toFixed(2)}`,
                overduePaymentsCount: overduePaymentsCount,
                totalOverdueAmount: totalOverdueAmount,
                formattedTotalOverdueAmount: `${currency} ${totalOverdueAmount.toFixed(2)}`
            },
            recentActivity: activity,
            upcomingPayments: upcomingPaymentsList,
        }
    });
});

// @desc    Get recent activity endpoint
// @route   GET /api/reports/recent-activity
// @access  Private (filterDataByRole applies relevant filters)
exports.getRecentActivity = asyncHandler(async (req, res, next) => {
    const currency = await getCurrency();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filters derived from req.dataFilter middleware
    let loanFilter = req.dataFilter || {};
    let transactionFilter = req.dataFilter || {};

    const [
        recentLoans,
        recentRepayments,
        recentSavingsDeposits,
        recentWithdrawals
    ] = await Promise.all([
        Loan.find({
            createdAt: { $gte: startOfMonth },
            ...loanFilter
        })
            .populate('borrower', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Transaction.find({
            type: 'loan_repayment',
            createdAt: { $gte: startOfMonth },
            ...transactionFilter
        })
            .populate('loan', 'borrower borrowerModel')
            .populate('member', 'name')
            .populate('group', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Transaction.find({
            type: 'deposit',
            createdAt: { $gte: startOfMonth },
            ...transactionFilter
        })
            .populate('member', 'name')
            .populate('group', 'name')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        Transaction.find({
            type: 'withdrawal',
            createdAt: { $gte: startOfMonth },
            ...transactionFilter
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
            formattedAmount: `${currency} ${loan.amountRequested.toFixed(2)}`
        })),
        ...recentRepayments.map(repayment => ({
            description: `Loan repayment of ${currency} ${repayment.amount.toFixed(2)} for loan by ${repayment.member?.name || repayment.group?.name || 'Unknown'}`,
            timestamp: repayment.createdAt,
            type: 'loan_repayment',
            amount: repayment.amount,
            formattedAmount: `${currency} ${repayment.amount.toFixed(2)}`
        })),
        ...recentSavingsDeposits.map(deposit => ({
            description: `Savings deposit of ${currency} ${deposit.amount.toFixed(2)} by ${deposit.member?.name || deposit.group?.name || 'Unknown'}`,
            timestamp: deposit.createdAt,
            type: 'deposit',
            amount: deposit.amount,
            formattedAmount: `${currency} ${deposit.amount.toFixed(2)}`
        })),
        ...recentWithdrawals.map(withdrawal => ({
            description: `Savings withdrawal of ${currency} ${withdrawal.amount.toFixed(2)} by ${withdrawal.member?.name || withdrawal.group?.name || 'Unknown'}`,
            timestamp: withdrawal.createdAt,
            type: 'withdrawal',
            amount: withdrawal.amount,
            formattedAmount: `${currency} ${withdrawal.amount.toFixed(2)}`
        })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

    res.status(200).json({
        success: true,
        data: allActivity
    });
});