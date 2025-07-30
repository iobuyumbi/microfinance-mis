// server\controllers\userController.js (REVISED)
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account'); // For savings/balances
const Transaction = require('../models/Transaction'); // For all financial movements
const Loan = require('../models/Loan'); // Ensure Loan model is imported for financial summary

const { asyncHandler } = require('../middleware');
const { ErrorResponse, settingsHelper } = require('../utils');
const mongoose = require('mongoose');

// @desc    Get all users - filtered based on user role and permissions
// @route   GET /api/users
// @access  Private (filterDataByRole middleware handles access)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware (e.g., { _id: req.user.id } for member, { 'groupRoles.groupId': { $in: [group1Id, group2Id] } } for leader)
  const query = req.dataFilter || {};

  const users = await User.find(query)
    .select('-password -__v') // Exclude password hash and version key
    .populate('groupRoles.groupId', 'name'); // Populate group name for each role

  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id)
    .select('-password -__v') // Exclude password hash and version key
    .populate('groupRoles.groupId', 'name');

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  res.status(200).json({ success: true, data: user });
});

// @desc    Update authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private (Self-service for authenticated user)
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };

  // Prevent direct updates to sensitive fields via this endpoint
  const sensitiveFields = [
    'role',
    'status',
    'password',
    'groupRoles',
    'createdAt',
    'updatedAt',
    'deleted',
    'deletedAt',
    'deletedBy',
  ];
  sensitiveFields.forEach(field => {
    if (updates.hasOwnProperty(field)) {
      delete updates[field];
    }
  });

  // Ensure there's something to update after stripping sensitive fields
  if (Object.keys(updates).length === 0) {
    return next(
      new ErrorResponse('No valid fields provided for profile update.', 400)
    );
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    select: '-password -__v', // Exclude password hash and version key from response
  });

  if (!user) {
    return next(new ErrorResponse('User not found.', 404)); // Should ideally not happen for req.user.id
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
});

// @desc    Update a user's global role or status (Admin/Officer only)
// @route   PUT /api/users/:id
// @access  Private (Admin, Officer) - authorizeRoles middleware handles this
exports.updateUserRoleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role, status } = req.body; // Both are optional due to route change

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Prevent a user from changing their own role/status via this endpoint if they are admin/officer
  // This forces admins/officers to use another admin/officer to modify their own sensitive fields.
  if (
    req.user.id === id &&
    (req.user.role === 'admin' || req.user.role === 'officer')
  ) {
    return next(
      new ErrorResponse(
        'Admins/Officers cannot change their own global role or status via this endpoint.',
        403
      )
    );
  }

  // Validate inputs if provided
  if (role) {
    const validGlobalRoles = ['admin', 'officer', 'leader', 'member'];
    if (!validGlobalRoles.includes(role)) {
      return next(new ErrorResponse('Invalid global role provided.', 400));
    }
    user.role = role;
  }

  if (status) {
    const validGlobalStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validGlobalStatuses.includes(status)) {
      return next(new ErrorResponse('Invalid global status provided.', 400));
    }
    user.status = status;
  }

  // Ensure at least one of role or status was provided to update
  if (!role && !status) {
    return next(
      new ErrorResponse(
        'At least one of "role" or "status" is required for update.',
        400
      )
    );
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User global role/status updated successfully.',
    data: user.toObject({
      virtuals: true,
      getters: true,
      exclude: ['password', '__v'],
    }),
  });
});

// @desc    Soft delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin) - authorizeRoles middleware handles this
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Prevent deleting self for admin (and prevent deleting the initial admin account if possible)
  if (user._id.toString() === req.user.id) {
    return next(
      new ErrorResponse(
        'You cannot delete your own account via this endpoint.',
        403
      )
    );
  }

  // Implement soft delete instead of hard delete for auditability
  // Start a transaction for atomicity if related financial data needs to be marked
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    user.deleted = true;
    user.deletedAt = new Date();
    user.deletedBy = req.user.id; // Record who soft-deleted it
    user.status = 'suspended'; // Also change global status to suspended
    // Optional: Invalidate user's active tokens if they are still logged in

    await user.save({ session });

    // Optionally, mark associated accounts/transactions as inactive/related to a deleted user
    await Account.updateMany(
      { owner: id, ownerModel: 'User' },
      { status: 'inactive' },
      { session }
    );
    // Transactions usually remain for audit, but could be marked with a flag if needed
    // await Transaction.updateMany({ member: id }, { /* set a flag like isAssociatedWithDeletedUser: true */ }, { session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: 'User soft-deleted successfully.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error soft-deleting user:', error);
    return next(new ErrorResponse('Failed to soft delete user.', 500));
  }
});

// @desc    Get user's groups
// @route   GET /api/users/:id/groups
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getUserGroups = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // userId from route parameter
  // authorizeOwnerOrAdmin('id') handles if req.user.id === id or req.user.role is admin/officer

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  // Find groups where the user is either a member or the creator
  const groups = await Group.find({
    $or: [{ members: id }, { createdBy: id }],
  })
    .populate('members', 'name email role status')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    count: groups.length,
    data: groups,
  });
});

// @desc    Get group members with proper access control
// @route   GET /api/groups/:groupId/members
// @access  Private (authorizeGroupAccess middleware handles permission)
exports.getGroupMembers = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid group ID format.', 400));
  }

  const group = await Group.findById(groupId).select('members createdBy');
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // Get group members with their global and group-specific roles
  const members = await User.find({
    _id: { $in: group.members },
  }).select('name email role status groupRoles');

  const filteredMembers = members.map(member => {
    const memberObj = member.toObject(); // Convert to plain object for modification
    const groupRoleEntry = memberObj.groupRoles.find(
      gr => gr.groupId.toString() === groupId
    );

    return {
      _id: memberObj._id,
      name: memberObj.name,
      email: memberObj.email,
      globalRole: memberObj.role,
      globalStatus: memberObj.status,
      groupRole: groupRoleEntry ? groupRoleEntry.role : 'member', // Default to 'member' if no explicit role
      groupStatus: groupRoleEntry ? groupRoleEntry.status : 'active', // Default to 'active'
    };
  });

  res.status(200).json({
    success: true,
    count: filteredMembers.length,
    data: filteredMembers,
  });
});

// @desc    Update group member's group-specific role and permissions
// @route   PUT /api/groups/:groupId/members/:memberId/role
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members')
exports.updateGroupMemberRole = asyncHandler(async (req, res, next) => {
  const { groupId, memberId } = req.params;
  const { role, permissions } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    return next(new ErrorResponse('Invalid Group or Member ID format.', 400));
  }

  if (!role && !permissions) {
    return next(
      new ErrorResponse('Role or permissions are required for update.', 400)
    );
  }

  const validGroupRoles = ['member', 'secretary', 'treasurer', 'chairman']; // Define valid group-specific roles
  if (role && !validGroupRoles.includes(role)) {
    return next(
      new ErrorResponse(
        `Invalid group role. Must be one of: ${validGroupRoles.join(', ')}.`,
        400
      )
    );
  }
  // TODO: Add validation for permissions array if permissions are predefined
  if (
    permissions &&
    (!Array.isArray(permissions) ||
      !permissions.every(p => typeof p === 'string'))
  ) {
    return next(
      new ErrorResponse('Permissions must be an array of strings.', 400)
    );
  }

  const user = await User.findById(memberId);
  if (!user) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId).select('members');
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }
  // Check if the user is actually a member of the group
  if (!group.members.includes(user._id)) {
    return next(new ErrorResponse('User is not a member of this group.', 400));
  }

  // Access control handled by authorizeGroupPermission middleware on the route

  const existingRoleIndex = user.groupRoles.findIndex(
    gr => gr.groupId.toString() === groupId
  );

  if (existingRoleIndex >= 0) {
    if (role) user.groupRoles[existingRoleIndex].role = role;
    if (permissions)
      user.groupRoles[existingRoleIndex].permissions = permissions;
  } else {
    // This case indicates the user is a member of the group, but has no groupRole entry.
    // It should add one.
    user.groupRoles.push({
      groupId: new mongoose.Types.ObjectId(groupId),
      role: role || 'member', // Default to 'member' if role not provided
      permissions: permissions || [],
      status: 'active', // Default status for new role entry
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Member role/permissions updated successfully',
    data: user.toObject({
      virtuals: true,
      getters: true,
      exclude: ['password', '__v'],
    }), // Return user with updated roles
  });
});

// @desc    Update group member's group-specific status
// @route   PUT /api/groups/:groupId/members/:memberId/status
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members')
exports.updateGroupMemberStatus = asyncHandler(async (req, res, next) => {
  const { groupId, memberId } = req.params;
  const { status } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    return next(new ErrorResponse('Invalid Group or Member ID format.', 400));
  }

  if (!status) {
    return next(new ErrorResponse('Status is required for update.', 400));
  }

  const validGroupStatuses = ['active', 'inactive', 'suspended'];
  if (!validGroupStatuses.includes(status)) {
    return next(
      new ErrorResponse(
        `Invalid status provided. Must be one of: ${validGroupStatuses.join(', ')}.`,
        400
      )
    );
  }

  const user = await User.findById(memberId);
  if (!user) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId).select('members');
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }
  // Check if the user is actually a member of the group
  if (!group.members.includes(user._id)) {
    return next(new ErrorResponse('User is not a member of this group.', 400));
  }

  // Access control handled by authorizeGroupPermission middleware on the route

  const groupRoleIndex = user.groupRoles.findIndex(
    gr => gr.groupId.toString() === groupId
  );

  if (groupRoleIndex >= 0) {
    user.groupRoles[groupRoleIndex].status = status;
  } else {
    // This case means the user is a member of the group (per group.members),
    // but somehow lacks a groupRole entry. Add a default one.
    user.groupRoles.push({
      groupId: new mongoose.Types.ObjectId(groupId),
      role: 'member', // Default role
      permissions: [],
      status: status, // Use provided status
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Member status updated successfully',
    data: user.toObject({
      virtuals: true,
      getters: true,
      exclude: ['password', '__v'],
    }),
  });
});

// @desc    Add member to group
// @route   POST /api/groups/:groupId/members
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members')
exports.addMemberToGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { email, memberId } = req.body; // Can accept either email or memberId

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid group ID format.', 400));
  }

  if (!email && !memberId) {
    return next(new ErrorResponse('Member email or ID is required.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  let user;
  if (email) {
    user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('User with this email not found.', 404));
    }
  } else {
    // memberId is provided
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return next(new ErrorResponse('Invalid member ID format.', 400));
    }
    user = await User.findById(memberId);
    if (!user) {
      return next(new ErrorResponse('User with this ID not found.', 404));
    }
  }

  // Check if user is already a member
  if (group.members.includes(user._id)) {
    return next(
      new ErrorResponse('User is already a member of this group.', 400)
    );
  }

  // Access control handled by authorizeGroupPermission middleware on the route

  // Start a session for atomicity (group members array and user's groupRoles)
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add user to group's members array
    group.members.push(user._id);
    await group.save({ session });

    // Add default 'member' group role to user if they don't have one for this group
    // If they were previously removed, their groupRole entry might still exist but with status 'inactive'/'suspended'
    const existingRoleIndex = user.groupRoles.findIndex(
      gr => gr.groupId.toString() === groupId
    );

    if (existingRoleIndex === -1) {
      // New entry for this group
      user.groupRoles.push({
        groupId: new mongoose.Types.ObjectId(groupId),
        role: 'member', // Default role upon joining
        permissions: [],
        status: 'active', // Default status
      });
    } else {
      // Update existing entry (e.g., if re-adding a user)
      user.groupRoles[existingRoleIndex].status = 'active';
      user.groupRoles[existingRoleIndex].role = 'member'; // Reset role to default member
      user.groupRoles[existingRoleIndex].permissions = []; // Reset permissions
    }
    await user.save({ session });

    // Optionally, create a default savings account for the user if they don't have one for this group
    // This assumes each member should have a 'savings' account tied to them within the group context.
    // If accounts are global per user, this might be handled elsewhere.
    // For simplicity, let's assume a user's primary savings account is global, created on user creation.
    // If a new account is needed *per group*, then uncomment and adjust below:
    // const existingAccount = await Account.findOne({ owner: user._id, ownerModel: 'User', type: 'savings', group: groupId }).session(session);
    // if (!existingAccount) {
    //     await Account.create([{
    //         owner: user._id,
    //         ownerModel: 'User',
    //         type: 'savings',
    //         group: groupId, // Link account to specific group if it's a group-specific account
    //         accountName: `${user.name}'s Savings (${group.name})`,
    //         balance: 0,
    //         currency: await getCurrency(),
    //     }], { session });
    // }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Member added successfully to group.',
      data: {
        groupId: group._id,
        memberId: user._id,
        memberName: user.name,
        memberEmail: user.email,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding member to group:', error);
    next(
      new ErrorResponse('Failed to add member to group. ' + error.message, 500)
    );
  }
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:groupId/members/:memberId
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members')
exports.removeMemberFromGroup = asyncHandler(async (req, res, next) => {
  const { groupId, memberId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    return next(new ErrorResponse('Invalid Group or Member ID format.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // Access control handled by authorizeGroupPermission middleware on the route

  // Check if the user is actually a member of the group
  const initialMemberCount = group.members.length;
  group.members = group.members.filter(id => id.toString() !== memberId);
  if (group.members.length === initialMemberCount) {
    return next(new ErrorResponse('User is not a member of this group.', 400));
  }

  // Start a session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await group.save({ session });

    // Change group role status to inactive/removed instead of deleting the entry
    // This preserves history for auditability
    const user = await User.findById(memberId).session(session);
    if (user) {
      const groupRoleIndex = user.groupRoles.findIndex(
        gr => gr.groupId.toString() === groupId
      );
      if (groupRoleIndex >= 0) {
        user.groupRoles[groupRoleIndex].status = 'inactive'; // Mark as inactive/removed from group
        // Optionally, clear permissions if they are group-specific
        // user.groupRoles[groupRoleIndex].permissions = [];
      }
      await user.save({ session });
    }

    // Optional: Perform financial checks
    // If the user has an outstanding loan balance for this group, prevent removal
    // Or if the user has funds in a group-specific account, require withdrawal first
    const userAccountsInGroup = await Account.find({
      owner: memberId,
      ownerModel: 'User',
      group: groupId,
    }).session(session);
    const hasBalanceInGroupAccounts = userAccountsInGroup.some(
      acc => acc.balance > 0
    );
    const outstandingLoansInGroup = await Loan.find({
      borrower: memberId,
      group: groupId,
      currentBalance: { $gt: 0 },
    }).session(session);

    if (hasBalanceInGroupAccounts) {
      return next(
        new ErrorResponse(
          'User has funds in group-specific accounts. Funds must be withdrawn before removal.',
          400
        )
      );
    }
    if (outstandingLoansInGroup.length > 0) {
      return next(
        new ErrorResponse(
          'User has outstanding loans in this group. Loans must be settled before removal.',
          400
        )
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully from group.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error removing member from group:', error);
    next(
      new ErrorResponse(
        'Failed to remove member from group. ' + error.message,
        500
      )
    );
  }
});

// @desc    Get user's financial summary
// @route   GET /api/users/:id/financial-summary (not :userId but :id due to route definition)
// @route   GET /api/users/me/financial-summary
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getUserFinancialSummary = asyncHandler(async (req, res, next) => {
  const userId = req.params.id === 'me' ? req.user.id : req.params.id; // Corrected to :id

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const currency = await settingsHelper.getCurrency();

  // Get user's primary savings account balance
  // Assuming 'savings' is the type for individual member savings
  const userSavingsAccount = await Account.findOne({
    owner: userId,
    ownerModel: 'User',
    type: 'savings',
    status: 'active', // Only consider active accounts
  });
  const totalSavings = userSavingsAccount ? userSavingsAccount.balance : 0;

  // Get loans associated with the user as borrower
  const userLoans = await Loan.find({
    borrower: userId,
    status: { $in: ['approved', 'pending', 'active', 'overdue', 'completed'] }, // Include relevant loan statuses
  });

  let totalLoansApproved = 0;
  let totalLoansPending = 0;
  let totalOutstandingLoanBalance = 0;
  let totalLoansPaid = 0;

  userLoans.forEach(loan => {
    if (
      loan.status === 'approved' ||
      loan.status === 'active' ||
      loan.status === 'overdue'
    ) {
      totalLoansApproved += loan.amountApproved || 0;
      totalOutstandingLoanBalance += loan.currentBalance || 0;
    } else if (loan.status === 'pending') {
      totalLoansPending += loan.amountRequested || 0;
    } else if (loan.status === 'completed') {
      // For completed loans, you might want to show the original approved amount or total repaid
      totalLoansPaid += loan.amountApproved || 0; // Or calculate from repayments if stored
    }
  });

  // Get user's transactions (deposits, withdrawals, loan repayments)
  const userTransactions = await Transaction.find({
    member: userId,
    deleted: false, // Ensure not soft-deleted
    status: 'completed', // Only show completed transactions in summary
  })
    .sort({ createdAt: -1 })
    .limit(10); // Last 10 transactions for history

  // Populate and format recent transactions
  const formattedTransactions = await Promise.all(
    userTransactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      obj.formattedAmount = await obj.formattedAmount;
      return obj;
    })
  );

  // Get groups the user is a member of or created
  const groups = await Group.find({
    $or: [{ members: userId }, { createdBy: userId }],
    status: 'active', // Only consider active groups
  }).select('name members createdBy');

  // Summarize group financial data (for groups where user is member/leader)
  const groupSummaries = await Promise.all(
    groups.map(async group => {
      const groupSavingsAccount = await Account.findOne({
        owner: group._id,
        ownerModel: 'Group',
        type: 'group_savings',
        status: 'active',
      });
      const groupLoans = await Loan.find({
        group: group._id,
        status: { $in: ['approved', 'active', 'overdue', 'completed'] },
      });

      let groupTotalSavings = groupSavingsAccount
        ? groupSavingsAccount.balance
        : 0;
      let groupTotalLoansApproved = 0;
      let groupTotalOutstandingLoans = 0;
      let groupTotalLoansPaid = 0;

      groupLoans.forEach(loan => {
        if (
          loan.status === 'approved' ||
          loan.status === 'active' ||
          loan.status === 'overdue'
        ) {
          groupTotalLoansApproved += loan.amountApproved || 0;
          groupTotalOutstandingLoans += loan.currentBalance || 0;
        } else if (loan.status === 'completed') {
          groupTotalLoansPaid += loan.amountApproved || 0;
        }
      });

      return {
        groupId: group._id,
        groupName: group.name,
        groupMembersCount: group.members.length,
        totalGroupSavings: groupTotalSavings,
        formattedTotalGroupSavings: `${currency} ${groupTotalSavings.toFixed(2)}`,
        totalGroupLoansApproved: groupTotalLoansApproved,
        formattedTotalGroupLoansApproved: `${currency} ${groupTotalLoansApproved.toFixed(2)}`,
        totalGroupOutstandingLoans: groupTotalOutstandingLoans,
        formattedTotalGroupOutstandingLoans: `${currency} ${groupTotalOutstandingLoans.toFixed(2)}`,
        totalGroupLoansPaid: groupTotalLoansPaid,
        formattedTotalGroupLoansPaid: `${currency} ${groupTotalLoansPaid.toFixed(2)}`,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      userId,
      personalSavings: totalSavings,
      formattedPersonalSavings: `${currency} ${totalSavings.toFixed(2)}`,
      personalLoans: {
        totalApproved: totalLoansApproved,
        formattedTotalApproved: `${currency} ${totalLoansApproved.toFixed(2)}`,
        totalPending: totalLoansPending,
        formattedTotalPending: `${currency} ${totalLoansPending.toFixed(2)}`,
        totalOutstanding: totalOutstandingLoanBalance,
        formattedTotalOutstanding: `${currency} ${totalOutstandingLoanBalance.toFixed(2)}`,
        totalPaid: totalLoansPaid,
        formattedTotalPaid: `${currency} ${totalLoansPaid.toFixed(2)}`,
      },
      recentTransactions: formattedTransactions,
      groupFinancialOverview: groupSummaries,
    },
  });
});
