// server\controllers\contributionController.js
const Transaction = require('../models/Transaction'); // Use Transaction model
const Account = require('../models/Account'); // Needed to update account balances
const User = require('../models/User'); // For populating member details
const Group = require('../models/Group'); // For populating group details
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse'); // Assuming you have this custom error class
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

// @desc    Get all savings contributions (system-wide or filtered by user/group)
// @route   GET /api/contributions
// @access  Private (Admin, Officer, Leader, Member - filtered by role)
exports.getAllContributions = asyncHandler(async (req, res, next) => {
    const { groupId, search } = req.query; // Removed year, period as they are not on Transaction model
    const currency = await getCurrency();

    let query = { type: 'savings_contribution' }; // Always filter for savings contributions

    // Apply data filter from middleware (if any)
    if (req.dataFilter) {
        Object.assign(query, req.dataFilter);
    }

    // Filter by specific group if provided (and not already covered by dataFilter)
    if (groupId && (!req.dataFilter || !req.dataFilter.group)) {
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return next(new ErrorResponse('Invalid Group ID format.', 400));
        }
        query.group = groupId;
    }

    // Search by member name (requires populate and then filter, or text index on User)
    // For now, we'll assume `member` field is directly searchable or populated
    if (search) {
        // This is a complex query for a large dataset.
        // For simple cases, we can find users matching the search and then filter transactions.
        const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
        const userIds = users.map(user => user._id);
        if (userIds.length > 0) {
            query.member = { $in: userIds };
        } else {
            // If no users found, return empty array
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
            });
        }
    }

    const contributions = await Transaction.find(query)
        .populate('group', 'name') // Populate group name
        .populate('member', 'name email') // Populate member name and email
        .populate('createdBy', 'name') // Populate who recorded it
        .sort({ createdAt: -1 });

    // Format amounts using the virtual (needs to be awaited if virtual is async)
    const formattedContributions = await Promise.all(contributions.map(async (cont) => {
        const obj = cont.toObject({ virtuals: true });
        obj.formattedAmount = await cont.formattedAmount; // Await the async virtual
        return obj;
    }));

    res.status(200).json({
        success: true,
        count: formattedContributions.length,
        data: formattedContributions,
    });
});

// @desc    Get a single savings contribution by Transaction ID
// @route   GET /api/contributions/:id
// @access  Private (Admin, Officer, Leader, Member - if they own it or have group access)
exports.getContribution = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Transaction ID format.', 400));
    }

    const currency = await getCurrency();

    let query = { _id: id, type: 'savings_contribution' };

    // Apply data filter from middleware
    if (req.dataFilter) {
        Object.assign(query, req.dataFilter);
    }

    const contribution = await Transaction.findOne(query)
        .populate('group', 'name')
        .populate('member', 'name email')
        .populate('createdBy', 'name');

    if (!contribution) {
        return next(new ErrorResponse('Savings contribution not found or you do not have access.', 404));
    }

    // Format amount using the virtual
    const formattedContribution = contribution.toObject({ virtuals: true });
    formattedContribution.formattedAmount = await contribution.formattedAmount;

    res.status(200).json({
        success: true,
        data: formattedContribution,
    });
});

// @desc    Create a new savings contribution
// @route   POST /api/contributions
// @access  Private (Admin, Officer, Leader - or Member for self-contribution)
exports.createContribution = asyncHandler(async (req, res, next) => {
    const { memberId, groupId, amount, description, paymentMethod } = req.body;

    // Basic validation
    if (!memberId || !groupId || !amount || amount <= 0) {
        return next(new ErrorResponse('Member ID, Group ID, and a positive amount are required.', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return next(new ErrorResponse('Invalid Member ID format.', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new ErrorResponse('Invalid Group ID format.', 400));
    }

    // Ensure the member exists
    const member = await User.findById(memberId);
    if (!member) {
        return next(new ErrorResponse('Member not found.', 404));
    }

    // Ensure the group exists
    const group = await Group.findById(groupId);
    if (!group) {
        return next(new ErrorResponse('Group not found.', 404));
    }

    // Find or create the member's savings account
    let memberAccount = await Account.findOne({ owner: memberId, ownerModel: 'User', type: 'savings' });
    if (!memberAccount) {
        // Create a new savings account for the user if it doesn't exist
        memberAccount = await Account.create({
            owner: memberId,
            ownerModel: 'User',
            type: 'savings',
            accountNumber: `SAV-${memberId.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`, // Simple unique account number
            balance: 0,
        });
    }

    // Calculate new balance
    const newBalance = memberAccount.balance + amount;

    // Create the Transaction record
    const transaction = await Transaction.create({
        type: 'savings_contribution',
        member: memberId,
        group: groupId,
        amount: amount,
        description: description || 'Member savings contribution',
        status: 'completed', // Assuming immediate completion for contributions
        balanceAfter: newBalance, // Crucial for audit trail
        createdBy: req.user.id, // User performing the action
        paymentMethod: paymentMethod || 'cash',
        relatedEntity: memberAccount._id, // Link to the account
        relatedEntityType: 'Account',
    });

    // Update the member's account balance
    memberAccount.balance = newBalance;
    await memberAccount.save();

    // Optionally, update totalSavings on the group (if you keep it there, though aggregation is preferred)
    // group.totalSavings += amount; // This would require careful management
    // await group.save();

    // Populate necessary fields for response
    await transaction.populate([
        { path: 'group', select: 'name' },
        { path: 'member', select: 'name email' },
        { path: 'createdBy', select: 'name' },
    ]);

    // Format amount using the virtual
    const formattedTransaction = transaction.toObject({ virtuals: true });
    formattedTransaction.formattedAmount = await transaction.formattedAmount;

    res.status(201).json({
        success: true,
        message: 'Savings contribution recorded successfully.',
        data: formattedTransaction,
    });
});

// @desc    Update a savings contribution (typically not done for financial records, use adjustment)
// @route   PUT /api/contributions/:id
// @access  Private (Admin, Officer)
exports.updateContribution = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Transaction ID format.', 400));
    }

    // For financial transactions, direct updates are generally discouraged
    // as they break the immutability of the ledger.
    // Instead, create an 'adjustment' transaction.
    // However, if you MUST update, be very careful with balance recalculations.

    // This is a simplified example for updating non-amount fields or status
    // For amount changes, it's highly recommended to create a new adjustment transaction.

    let transaction = await Transaction.findOne({ _id: id, type: 'savings_contribution' });

    if (!transaction) {
        return next(new ErrorResponse('Savings contribution not found.', 404));
    }

    // Prevent direct amount changes here. If amount needs change, create a new adjustment transaction.
    if (req.body.amount !== undefined && req.body.amount !== transaction.amount) {
        return next(new ErrorResponse('Direct amount modification of past contributions is not allowed. Please create an adjustment transaction.', 400));
    }

    // Only allow updates to description, status, paymentMethod, etc.
    const allowedUpdates = ['description', 'status', 'paymentMethod'];
    const updates = {};
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    // If status changes to cancelled/failed, consider reversing the account balance
    if (updates.status && updates.status !== transaction.status) {
        // This is complex and needs careful handling.
        // For simplicity, this example assumes only non-financial field updates.
        // For status changes affecting balance, you'd need to create a new adjustment transaction.
        if (updates.status === 'cancelled' || updates.status === 'failed') {
             return next(new ErrorResponse('Changing contribution status to cancelled/failed requires a separate adjustment transaction to reverse the balance.', 400));
        }
    }


    transaction = await Transaction.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    }).populate([
        { path: 'group', select: 'name' },
        { path: 'member', select: 'name email' },
        { path: 'createdBy', select: 'name' },
    ]);

    // Format amount using the virtual
    const formattedTransaction = transaction.toObject({ virtuals: true });
    formattedTransaction.formattedAmount = await transaction.formattedAmount;

    res.status(200).json({
        success: true,
        message: 'Savings contribution updated successfully (non-financial fields).',
        data: formattedTransaction,
    });
});

// @desc    Soft delete a savings contribution (use adjustment for financial reversal)
// @route   DELETE /api/contributions/:id
// @access  Private (Admin only)
exports.deleteContribution = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Transaction ID format.', 400));
    }

    const transaction = await Transaction.findOne({ _id: id, type: 'savings_contribution' });

    if (!transaction) {
        return next(new ErrorResponse('Savings contribution not found.', 404));
    }

    // Instead of hard deleting, we soft delete and recommend an adjustment transaction
    // to reverse the financial impact if it was 'completed'.
    if (transaction.status === 'completed' && !transaction.deleted) {
        return next(new ErrorResponse('Cannot directly delete a completed savings contribution. Please create a "refund" or "adjustment" transaction to reverse the amount from the member\'s account, then soft-delete this record.', 400));
    }

    transaction.deleted = true;
    transaction.deletedAt = new Date();
    await transaction.save();

    res.status(200).json({
        success: true,
        message: 'Savings contribution soft-deleted successfully.',
        data: {},
    });
});

// @desc    Get savings contributions by group
// @route   GET /api/groups/:groupId/contributions
// @access  Private (Admin, Officer, Leader, Member - if they belong to the group)
exports.getGroupContributions = asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new ErrorResponse('Invalid Group ID format.', 400));
    }
    const currency = await getCurrency();

    const contributions = await Transaction.find({
        group: groupId,
        type: 'savings_contribution',
        deleted: false,
    })
        .populate('member', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    const formattedContributions = await Promise.all(contributions.map(async (cont) => {
        const obj = cont.toObject({ virtuals: true });
        obj.formattedAmount = await cont.formattedAmount;
        return obj;
    }));

    res.status(200).json({
        success: true,
        count: formattedContributions.length,
        data: formattedContributions,
    });
});

// @desc    Get savings contribution summary for a group
// @route   GET /api/groups/:groupId/contributions/summary
// @access  Private (Admin, Officer, Leader)
exports.getContributionSummary = asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new ErrorResponse('Invalid Group ID format.', 400));
    }
    const currency = await getCurrency();

    // Aggregate total contributions for the group
    const totalContributionsResult = await Transaction.aggregate([
        {
            $match: {
                group: new mongoose.Types.ObjectId(groupId),
                type: 'savings_contribution',
                status: 'completed',
                deleted: false,
            },
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);

    const totalContributions = totalContributionsResult.length > 0 ? totalContributionsResult[0].totalAmount : 0;

    // Aggregate contributions by member for the group
    const memberContributions = await Transaction.aggregate([
        {
            $match: {
                group: new mongoose.Types.ObjectId(groupId),
                type: 'savings_contribution',
                status: 'completed',
                deleted: false,
            },
        },
        {
            $group: {
                _id: '$member', // Group by member ID
                totalMemberAmount: { $sum: '$amount' },
                lastContributionDate: { $max: '$createdAt' },
            },
        },
        {
            $lookup: { // Populate member details
                from: 'users', // Collection name for User model
                localField: '_id',
                foreignField: '_id',
                as: 'memberInfo',
            },
        },
        {
            $unwind: '$memberInfo', // Deconstruct the memberInfo array
        },
        {
            $project: { // Shape the output
                _id: 0,
                memberId: '$_id',
                memberName: '$memberInfo.name',
                memberEmail: '$memberInfo.email',
                totalContribution: '$totalMemberAmount',
                lastContributionDate: '$lastContributionDate',
            },
        },
        {
            $sort: { memberName: 1 }, // Sort by member name
        },
    ]);

    // Calculate total members (distinct members who made contributions)
    const totalMembers = memberContributions.length;

    const summary = {
        groupId,
        totalMembers,
        totalSavingsContributions: totalContributions,
        memberContributions: await Promise.all(memberContributions.map(async (mc) => {
            mc.formattedTotalContribution = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(mc.totalContribution);
            return mc;
        })),
        // interestEarned: 28.0, // This should be calculated from actual data or fetched from a specific transaction type
        // The 'interestEarned' would likely come from 'interest_earned' transactions on the group's account
    };

    res.status(200).json({
        success: true,
        data: summary,
    });
});


// @desc    Bulk import savings contributions
// @route   POST /api/groups/:groupId/contributions/bulk
// @access  Private (Admin, Officer)
exports.bulkImportContributions = asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { contributions } = req.body; // Expects an array of { memberId, amount, description, paymentMethod }

    if (!Array.isArray(contributions) || contributions.length === 0) {
        return next(new ErrorResponse('Contributions must be a non-empty array.', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new ErrorResponse('Invalid Group ID format.', 400));
    }

    const createdTransactions = [];
    const session = await mongoose.startSession(); // Start a session for atomicity
    session.startTransaction();

    try {
        for (const cont of contributions) {
            const { memberId, amount, description, paymentMethod } = cont;

            if (!memberId || !amount || amount <= 0) {
                throw new ErrorResponse(`Invalid contribution data for member ${memberId || 'unknown'}. Missing memberId, amount, or amount is not positive.`, 400);
            }
            if (!mongoose.Types.ObjectId.isValid(memberId)) {
                throw new ErrorResponse(`Invalid Member ID format found in bulk import: ${memberId}`, 400);
            }

            // Find or create the member's savings account
            let memberAccount = await Account.findOne({ owner: memberId, ownerModel: 'User', type: 'savings' }).session(session);
            if (!memberAccount) {
                memberAccount = await Account.create([{
                    owner: memberId,
                    ownerModel: 'User',
                    type: 'savings',
                    accountNumber: `SAV-${memberId.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
                    balance: 0,
                }], { session });
                memberAccount = memberAccount[0]; // create returns an array
            }

            const newBalance = memberAccount.balance + amount;

            const transaction = await Transaction.create([{
                type: 'savings_contribution',
                member: memberId,
                group: groupId,
                amount: amount,
                description: description || 'Bulk savings contribution',
                status: 'completed',
                balanceAfter: newBalance,
                createdBy: req.user.id,
                paymentMethod: paymentMethod || 'cash',
                relatedEntity: memberAccount._id,
                relatedEntityType: 'Account',
            }], { session });

            // Update the member's account balance
            memberAccount.balance = newBalance;
            await memberAccount.save({ session });

            createdTransactions.push(transaction[0]); // Push the created transaction document
        }

        await session.commitTransaction();
        session.endSession();

        // Populate for response
        const populatedTransactions = await Promise.all(createdTransactions.map(async (tx) => {
            await tx.populate([
                { path: 'group', select: 'name' },
                { path: 'member', select: 'name email' },
                { path: 'createdBy', select: 'name' },
            ]);
            const obj = tx.toObject({ virtuals: true });
            obj.formattedAmount = await tx.formattedAmount;
            return obj;
        }));


        res.status(201).json({
            success: true,
            count: populatedTransactions.length,
            message: 'Bulk savings contributions imported successfully.',
            data: populatedTransactions,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        // Pass the error to the global error handler
        next(error);
    }
});

// @desc    Export savings contributions
// @route   GET /api/groups/:groupId/contributions/export
// @access  Private (Admin, Officer, Leader)
exports.exportContributions = asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const { format = 'json' } = req.query; // Default to json, as CSV generation is more complex

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return next(new ErrorResponse('Invalid Group ID format.', 400));
    }
    const currency = await getCurrency();

    const contributions = await Transaction.find({
        group: groupId,
        type: 'savings_contribution',
        deleted: false,
    })
        .populate('member', 'name email') // Populate member name and email
        .populate('createdBy', 'name') // Populate who recorded it
        .sort({ createdAt: 1 }); // Sort chronologically for export

    // Prepare data for export
    const exportData = await Promise.all(contributions.map(async (tx) => {
        const memberName = tx.member ? tx.member.name : 'N/A';
        const createdByName = tx.createdBy ? tx.createdBy.name : 'N/A';
        const formattedAmount = await tx.formattedAmount; // Await the async virtual

        return {
            'Transaction ID': tx._id.toString(),
            'Member ID': tx.member ? tx.member._id.toString() : 'N/A',
            'Member Name': memberName,
            'Group ID': tx.group.toString(),
            'Amount': tx.amount,
            'Formatted Amount': formattedAmount,
            'Description': tx.description,
            'Payment Method': tx.paymentMethod,
            'Balance After': tx.balanceAfter,
            'Recorded By': createdByName,
            'Date': tx.createdAt.toISOString(),
            'Status': tx.status,
        };
    }));

    if (format === 'csv') {
        // For CSV, you'd typically use a library like 'csv-stringify'
        // This is a simplified direct JSON response for now.
        // You'd need to install a CSV library and stream the response.
        // Example: const { stringify } = require('csv-stringify');
        // stringify(exportData, { header: true }, (err, output) => {
        //     if (err) return next(new ErrorResponse('Error generating CSV', 500));
        //     res.header('Content-Type', 'text/csv');
        //     res.attachment(`group_${groupId}_contributions.csv`);
        //     res.send(output);
        // });
        res.status(200).json({
            success: true,
            message: 'CSV export functionality needs a dedicated library. Returning JSON for now.',
            data: exportData,
            format: 'json', // Still returning JSON
        });

    } else { // Default to JSON
        res.status(200).json({
            success: true,
            data: exportData,
            format: 'json',
        });
    }
});

// @desc    Get a member's savings contribution history
// @route   GET /api/members/:memberId/contributions
// @access  Private (Admin, Officer, Leader - if in same group, Member - if own data)
exports.getMemberContributionHistory = asyncHandler(async (req, res, next) => {
    const { memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return next(new ErrorResponse('Invalid Member ID format.', 400));
    }
    const currency = await getCurrency();

    let query = { member: memberId, type: 'savings_contribution', deleted: false };

    // Apply data filter from middleware
    if (req.dataFilter) {
        // Ensure the memberId in the query is consistent with the dataFilter's user/userId
        // This logic might need refinement based on how dataFilter is constructed for specific user access
        // For 'member' role, req.dataFilter will limit to req.user._id, ensuring they only see their own.
        // For 'leader'/'officer', req.dataFilter will include groups they manage/belong to.
        // For this specific route, `authorizeOwnerOrAdmin` or `authorizeGroupAccess` should be used as middleware.
        Object.assign(query, req.dataFilter);
    }

    const contributions = await Transaction.find(query)
        .populate('group', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    const formattedContributions = await Promise.all(contributions.map(async (cont) => {
        const obj = cont.toObject({ virtuals: true });
        obj.formattedAmount = await cont.formattedAmount;
        return obj;
    }));

    res.status(200).json({
        success: true,
        count: formattedContributions.length,
        data: formattedContributions,
    });
});