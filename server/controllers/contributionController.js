// server\controllers\contributionController.js (REVISED)
const Transaction = require('../models/Transaction'); // Use Transaction model
const Account = require('../models/Account'); // Needed to update account balances
const User = require('../models/User'); // For populating member details
const Group = require('../models/Group'); // For populating group details
const UserGroupMembership = require('../models/UserGroupMembership'); // For authorization checks
const asyncHandler = require('../middleware/asyncHandler'); // Ensure this is correctly imported
const { ErrorResponse } = require('../utils'); // Import custom error class
const { getCurrencyFromSettings } = require('../utils/currencyUtils'); // <<< ADD THIS IMPORT
const mongoose = require('mongoose');

// REMOVED: Old getCurrency helper function, now imported from currencyUtils.js

// @desc    Get all savings contributions (system-wide or filtered by user/group)
// @route   GET /api/contributions
// @access  Private (Admin, Officer, Leader, Member - filtered by role)
exports.getAllContributions = asyncHandler(async (req, res, next) => {
  const { groupId, search } = req.query;
  // const currency = await getCurrencyFromSettings(); // Not directly used here, virtual handles it

  // `req.dataFilter` is set by the `filterDataByRole('Transaction')` middleware.
  // It will already contain conditions for `member`, `group`, and `loan` access.
  const query = {
    type: 'savings_contribution',
    deleted: false,
    ...(req.dataFilter || {}),
  }; // Added deleted: false

  // Apply additional filter by specific group if provided in query params
  // This allows further narrowing down results within the user's accessible data.
  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return next(new ErrorResponse('Invalid Group ID format.', 400));
    }
    // If req.dataFilter already has a group filter, this needs to be an $and
    // For simplicity, we'll assume groupId in query is a further restriction.
    query.group = groupId;
  }

  // Search by member name (requires finding user IDs first)
  if (search) {
    const users = await User.find({
      name: { $regex: search, $options: 'i' },
      // Ensure search is within accessible users if req.dataFilter.User exists
      ...(req.dataFilter?.User || {}),
    }).select('_id');
    const userIds = users.map(user => user._id);

    if (userIds.length > 0) {
      // If query.member already exists (from req.dataFilter), combine with $in
      if (query.member && query.member.$in) {
        query.member.$in = query.member.$in.filter(id =>
          userIds.some(uid => uid.equals(id))
        );
      } else {
        query.member = { $in: userIds };
      }
    } else {
      // If no users found matching search, ensure no results are returned
      query.member = { $in: [] };
    }
  }

  const contributions = await Transaction.find(query)
    .populate('group', 'name')
    .populate('member', 'name email')
    .populate('createdBy', 'name')
    .populate('account', 'accountNumber accountName type') // Added account populate
    .sort({ createdAt: -1 });

  const formattedContributions = await Promise.all(
    contributions.map(async cont => {
      const obj = cont.toObject({ virtuals: true });
      obj.formattedAmount = await obj.formattedAmount;
      return obj;
    })
  );

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

  // `req.dataFilter` is set by the `filterDataByRole('Transaction')` middleware.
  const query = {
    _id: id,
    type: 'savings_contribution',
    deleted: false, // Added deleted: false
    ...(req.dataFilter || {}),
  };

  const contribution = await Transaction.findOne(query)
    .populate('group', 'name')
    .populate('member', 'name email')
    .populate('createdBy', 'name')
    .populate('account', 'accountNumber accountName type'); // Added account populate

  if (!contribution) {
    return next(
      new ErrorResponse(
        'Savings contribution not found or you do not have access.',
        404
      )
    );
  }

  const formattedContribution = contribution.toObject({ virtuals: true });
  formattedContribution.formattedAmount =
    await formattedContribution.formattedAmount;

  res.status(200).json({
    success: true,
    data: formattedContribution,
  });
});

// @desc    Create a new contribution
// @route   POST /api/contributions
// @access  Private (Admin, Officer, Leader - or Member for self-contribution)
exports.createContribution = asyncHandler(async (req, res, next) => {
  const { memberId, groupId, amount, description, paymentMethod } = req.body;

  // Basic validation (some fields are already validated by `validateRequiredFields` middleware)
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (amount <= 0) {
    return next(new ErrorResponse('Amount must be positive.', 400));
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

  // Authorization:
  // Admin/Officer can create for anyone.
  // Member can create for themselves.
  // Leader can create for members within their group.
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    if (memberId.toString() === req.user._id.toString()) {
      // User is creating for themselves. Check if they are a member of the group.
      const isMemberOfGroup = await UserGroupMembership.findOne({
        user: req.user._id,
        group: groupId,
        status: 'active',
      });
      if (!isMemberOfGroup) {
        return next(
          new ErrorResponse(
            'Access denied. You can only contribute to groups you are an active member of.',
            403
          )
        );
      }
    } else {
      // User is trying to create for another member. Must be a leader with 'can_manage_contributions'
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: groupId,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        !membership.groupRole.permissions.includes('can_manage_contributions')
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_manage_contributions" permission within this group to record contributions for other members.',
            403
          )
        );
      }
      // Also ensure the target member is part of this group
      const targetMemberInGroup = await UserGroupMembership.findOne({
        user: memberId,
        group: groupId,
        status: 'active',
      });
      if (!targetMemberInGroup) {
        return next(
          new ErrorResponse(
            'Target member is not an active member of this group.',
            400
          )
        );
      }
    }
  }

  // Import financial utilities
  const {
    createFinancialTransaction,
    validateTransactionData,
  } = require('../utils/financialUtils');

  // Validate transaction data
  const validation = validateTransactionData({
    type: 'savings_contribution',
    amount,
    member: memberId,
    group: groupId,
    createdBy: req.user.id,
  });

  if (!validation.isValid) {
    return next(
      new ErrorResponse(
        `Validation failed: ${validation.errors.join(', ')}`,
        400
      )
    );
  }

  try {
    // Find or create the member's savings account
    let memberAccount = await Account.findOne({
      owner: memberId,
      ownerModel: 'User',
      type: 'savings',
      status: 'active',
    });

    if (!memberAccount) {
      // Create account for member if it doesn't exist
      memberAccount = await Account.create({
        owner: memberId,
        ownerModel: 'User',
        type: 'savings',
        accountNumber: `SAV-${memberId.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
        balance: 0,
        status: 'active',
      });
    }

    // Create the financial transaction using the utility function
    const { transaction, account } = await createFinancialTransaction({
      type: 'savings_contribution',
      amount,
      description: description || `Savings contribution to ${group.name}`,
      member: memberId,
      group: groupId,
      account: memberAccount._id,
      status: 'completed',
      createdBy: req.user.id,
      paymentMethod: paymentMethod || 'cash',
      relatedEntity: memberAccount._id,
      relatedEntityType: 'Account',
    });

    // Populate necessary fields for response
    await transaction.populate([
      { path: 'group', select: 'name' },
      { path: 'member', select: 'name email' },
      { path: 'createdBy', select: 'name' },
      { path: 'relatedEntity', select: 'accountNumber type' },
    ]);

    const formattedTransaction = transaction.toObject({ virtuals: true });
    formattedTransaction.formattedAmount = await transaction.formattedAmount;

    res.status(201).json({
      success: true,
      message: 'Savings contribution recorded successfully.',
      data: formattedTransaction,
    });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return next(
      new ErrorResponse(`Failed to create contribution: ${error.message}`, 500)
    );
  }
});

// @desc    Update a savings contribution (typically not done for financial records, use adjustment)
// @route   PUT /api/contributions/:id
// @access  Private (Admin, Officer) - restricted to these roles due to financial sensitivity
exports.updateContribution = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Transaction ID format.', 400));
  }

  // Apply data filter from middleware for initial retrieval
  let transaction = await Transaction.findOne({
    _id: id,
    type: 'savings_contribution',
    deleted: false, // Added deleted: false
    ...(req.dataFilter || {}), // Ensure only accessible transactions can be updated
  });

  if (!transaction) {
    return next(
      new ErrorResponse(
        'Savings contribution not found or you do not have access to update.',
        404
      )
    );
  }

  // Prevent direct amount changes here. Highly recommend creating an adjustment transaction instead.
  if (req.body.amount !== undefined && req.body.amount !== transaction.amount) {
    return next(
      new ErrorResponse(
        'Direct amount modification of past contributions is not allowed. Please create an adjustment transaction.',
        400
      )
    );
  }

  // Only allow updates to description, status, paymentMethod, etc.
  const allowedUpdates = ['description', 'status', 'paymentMethod'];
  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // If status changes to cancelled/failed, it still requires a separate adjustment to reverse balance.
  // This controller only updates the transaction record itself, not its financial impact.
  if (
    updates.status &&
    updates.status !== transaction.status &&
    (updates.status === 'cancelled' || updates.status === 'failed')
  ) {
    return next(
      new ErrorResponse(
        'Changing contribution status to cancelled/failed requires a separate adjustment transaction to reverse the balance.',
        400
      )
    );
  }

  // Find and update, ensuring the transaction type is correct
  transaction = await Transaction.findOneAndUpdate(
    {
      _id: id,
      type: 'savings_contribution',
      deleted: false,
      ...(req.dataFilter || {}),
    }, // Re-apply filter for update operation + deleted: false
    updates,
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: 'group', select: 'name' },
    { path: 'member', select: 'name email' },
    { path: 'createdBy', select: 'name' },
    { path: 'account', select: 'accountNumber accountName type' },
  ]);

  if (!transaction) {
    // Check again after update attempt, if filter prevented it
    return next(
      new ErrorResponse(
        'Savings contribution could not be updated or you do not have access.',
        500
      )
    ); // More specific message
  }

  const formattedTransaction = transaction.toObject({ virtuals: true });
  formattedTransaction.formattedAmount =
    await formattedTransaction.formattedAmount;

  res.status(200).json({
    success: true,
    message:
      'Savings contribution updated successfully (non-financial fields).',
    data: formattedTransaction,
  });
});

// @desc    Soft delete a savings contribution (use adjustment for financial reversal)
// @route   DELETE /api/contributions/:id
// @access  Private (Admin, Officer) - restricted to these roles due to financial sensitivity
exports.deleteContribution = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Transaction ID format.', 400));
  }

  // Apply data filter from middleware for initial retrieval
  const transaction = await Transaction.findOne({
    _id: id,
    type: 'savings_contribution',
    deleted: false, // Added deleted: false
    ...(req.dataFilter || {}), // Ensure only accessible transactions can be deleted
  });

  if (!transaction) {
    return next(
      new ErrorResponse(
        'Savings contribution not found or you do not have access to delete.',
        404
      )
    );
  }

  // Instead of hard deleting, we soft delete and require an explicit adjustment transaction
  // to reverse the financial impact if it was 'completed'.
  if (transaction.status === 'completed' && !transaction.deleted) {
    return next(
      new ErrorResponse(
        'Cannot directly delete a completed savings contribution. Please create a "refund" or "adjustment" transaction to reverse the amount from the member\'s account, then soft-delete this record.',
        400
      )
    );
  }

  transaction.deleted = true;
  transaction.deletedAt = new Date();
  transaction.deletedBy = req.user.id; // Record who soft-deleted it
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

  // Authorization: Handled by `authorizeGroupAccess` middleware on route.
  // `filterDataByRole('Transaction')` middleware will also ensure the user can only see transactions
  // within their accessible groups.

  const query = {
    group: groupId,
    type: 'savings_contribution',
    deleted: false,
    ...(req.dataFilter || {}), // Apply data filter from middleware
  };

  const contributions = await Transaction.find(query)
    .populate('member', 'name email')
    .populate('createdBy', 'name')
    .populate('account', 'accountNumber accountName type') // Added account populate
    .sort({ createdAt: -1 });

  const formattedContributions = await Promise.all(
    contributions.map(async cont => {
      const obj = cont.toObject({ virtuals: true });
      obj.formattedAmount = await obj.formattedAmount;
      return obj;
    })
  );

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
  const currency = await getCurrencyFromSettings(); // Use imported helper

  // Authorization: Handled by `authorizeGroupAccess` middleware on route.
  // `filterDataByRole('Transaction')` middleware will also ensure the user can only aggregate transactions
  // within their accessible groups.

  const matchQuery = {
    group: new mongoose.Types.ObjectId(groupId),
    type: 'savings_contribution',
    status: 'completed',
    deleted: false, // Added deleted: false
    ...(req.dataFilter || {}), // Apply data filter from middleware to the aggregation match
  };

  // Aggregate total contributions for the group
  const totalContributionsResult = await Transaction.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const totalContributions =
    totalContributionsResult.length > 0
      ? totalContributionsResult[0].totalAmount
      : 0;

  // Aggregate contributions by member for the group
  const memberContributions = await Transaction.aggregate([
    { $match: matchQuery }, // Apply data filter here too
    {
      $group: {
        _id: '$member', // Group by member ID
        totalMemberAmount: { $sum: '$amount' },
        lastContributionDate: { $max: '$createdAt' },
      },
    },
    {
      $lookup: {
        from: 'users', // Collection name for User model
        localField: '_id',
        foreignField: '_id',
        as: 'memberInfo',
      },
    },
    {
      $unwind: { path: '$memberInfo', preserveNullAndEmptyArrays: true }, // Use preserveNullAndEmptyArrays for members without info
    },
    {
      $project: {
        _id: 0,
        memberId: '$_id',
        memberName: '$memberInfo.name',
        memberEmail: '$memberInfo.email',
        totalContribution: '$totalMemberAmount',
        lastContributionDate: '$lastContributionDate',
      },
    },
    {
      $sort: { memberName: 1 },
    },
  ]);

  const totalMembers = memberContributions.length;

  const summary = {
    groupId,
    totalMembers,
    totalSavingsContributions: totalContributions,
    formattedTotalSavingsContributions: `${currency} ${totalContributions.toFixed(2)}`,
    memberContributions: await Promise.all(
      memberContributions.map(async mc => {
        mc.formattedTotalContribution = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
        }).format(mc.totalContribution);
        return mc;
      })
    ),
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
});

// @desc    Bulk import savings contributions
// @route   POST /api/groups/:groupId/contributions/bulk
// @access  Private (Admin, Officer) - restricted to these roles
exports.bulkImportContributions = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { contributions } = req.body; // Expects an array of { memberId, amount, description, paymentMethod }

  if (!Array.isArray(contributions) || contributions.length === 0) {
    return next(
      new ErrorResponse('Contributions must be a non-empty array.', 400)
    );
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  // Verify group exists
  const groupExists = await Group.findById(groupId);
  if (!groupExists) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const createdTransactions = [];
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const cont of contributions) {
      const { memberId, amount, description, paymentMethod } = cont;

      if (!memberId || !amount || amount <= 0) {
        throw new ErrorResponse(
          `Invalid contribution data for member ${memberId || 'unknown'}. Missing memberId, amount, or amount is not positive.`,
          400
        );
      }
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        throw new ErrorResponse(
          `Invalid Member ID format found in bulk import: ${memberId}`,
          400
        );
      }

      // Ensure member exists and is part of this group (optional but good for data integrity)
      const memberInGroup = await UserGroupMembership.findOne({
        user: memberId,
        group: groupId,
        status: 'active',
      }).session(session);
      if (!memberInGroup) {
        throw new ErrorResponse(
          `Member ${memberId} is not an active member of group ${groupId}.`,
          400
        );
      }

      // Find or create the member's savings account
      let memberAccount = await Account.findOne({
        owner: memberId,
        ownerModel: 'User',
        type: 'savings',
        deleted: false,
      }).session(session);
      if (!memberAccount) {
        const memberUser = await User.findById(memberId).session(session);
        if (!memberUser)
          throw new ErrorResponse(`User ${memberId} not found.`, 404);

        memberAccount = await Account.create(
          [
            {
              owner: memberId,
              ownerModel: 'User',
              type: 'savings',
              accountNumber: `SAV-${memberId.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
              balance: 0,
              accountName: `${memberUser.name}'s Savings`,
              createdBy: req.user.id, // The user performing the bulk import
            },
          ],
          { session }
        );
        memberAccount = memberAccount[0];
      }

      const newBalance = memberAccount.balance + amount;

      const transaction = await Transaction.create(
        [
          {
            type: 'savings_contribution',
            member: memberId,
            group: groupId,
            account: memberAccount._id,
            amount,
            description: description || 'Bulk savings contribution',
            status: 'completed',
            balanceAfter: newBalance,
            createdBy: req.user.id,
            paymentMethod: paymentMethod || 'cash',
            relatedEntity: memberAccount._id,
            relatedEntityType: 'Account',
          },
        ],
        { session }
      );

      memberAccount.balance = newBalance;
      await memberAccount.save({ session });

      createdTransactions.push(transaction[0]);
    }

    await session.commitTransaction();
    session.endSession();

    const populatedTransactions = await Promise.all(
      createdTransactions.map(async tx => {
        await tx.populate([
          { path: 'group', select: 'name' },
          { path: 'member', select: 'name email' },
          { path: 'createdBy', select: 'name' },
          { path: 'account', select: 'accountNumber accountName type' },
        ]);
        const obj = tx.toObject({ virtuals: true });
        obj.formattedAmount = await obj.formattedAmount;
        return obj;
      })
    );

    res.status(201).json({
      success: true,
      count: populatedTransactions.length,
      message: 'Bulk savings contributions imported successfully.',
      data: populatedTransactions,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error during bulk import of contributions:', error); // Specific error message
    next(error);
  }
});

// @desc    Export savings contributions
// @route   GET /api/groups/:groupId/contributions/export
// @access  Private (Admin, Officer, Leader)
exports.exportContributions = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { format = 'json' } = req.query;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  const currency = await getCurrencyFromSettings(); // Use imported helper

  // Authorization: Handled by `authorizeGroupAccess` middleware on the route.
  // The `filterDataByRole` middleware for 'Transaction' will also ensure the user can only export transactions
  // within their accessible groups.

  const contributions = await Transaction.find({
    group: groupId,
    type: 'savings_contribution',
    deleted: false,
    ...(req.dataFilter || {}), // Apply data filter from middleware
  })
    .populate('member', 'name email')
    .populate('createdBy', 'name')
    .populate('account', 'accountNumber accountName type') // Added account populate
    .sort({ createdAt: 1 });

  const exportData = await Promise.all(
    contributions.map(async tx => {
      const memberName = tx.member ? tx.member.name : 'N/A';
      const memberEmail = tx.member ? tx.member.email : 'N/A';
      const createdByName = tx.createdBy ? tx.createdBy.name : 'N/A';
      const formattedAmount = await tx.formattedAmount; // Virtual handles currency

      return {
        'Transaction ID': tx._id.toString(),
        'Member ID': tx.member ? tx.member._id.toString() : 'N/A',
        'Member Name': memberName,
        'Member Email': memberEmail,
        'Group ID': tx.group.toString(),
        Amount: tx.amount,
        'Formatted Amount': formattedAmount,
        Description: tx.description,
        'Payment Method': tx.paymentMethod,
        'Balance After': tx.balanceAfter,
        'Recorded By': createdByName,
        Date: tx.createdAt.toISOString(),
        Status: tx.status,
      };
    })
  );

  if (format === 'csv') {
    // Placeholder for CSV export. You'd integrate a library here.
    // For actual CSV, you'd convert exportData to CSV string and set appropriate headers.
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=contributions-${groupId}.csv`
    );
    // Example using a simple CSV string (requires a CSV library for robustness)
    const csvString = [
      Object.keys(exportData[0]).join(','), // Headers
      ...exportData.map(row =>
        Object.values(row)
          .map(val => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      ), // Data rows
    ].join('\n');
    res.status(200).send(csvString);
  } else {
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
  // const currency = await getCurrencyFromSettings(); // Not directly used here

  // Authorization: Handled by `authorizeOwnerOrAdmin` or `authorizeGroupAccess` middleware on the route.
  // The `filterDataByRole` middleware for 'Transaction' will also ensure the user can only see transactions
  // for members within their accessible scope.

  const query = {
    member: memberId,
    type: 'savings_contribution',
    deleted: false,
    ...(req.dataFilter || {}), // Apply data filter from middleware
  };

  const contributions = await Transaction.find(query)
    .populate('group', 'name')
    .populate('createdBy', 'name')
    .populate('account', 'accountNumber accountName type') // Added account populate
    .sort({ createdAt: -1 });

  const formattedContributions = await Promise.all(
    contributions.map(async cont => {
      const obj = cont.toObject({ virtuals: true });
      obj.formattedAmount = await obj.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedContributions.length,
    data: formattedContributions,
  });
});
