// server\controllers\userController.js
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account'); // Use Account for savings/balances
const Transaction = require('../models/Transaction'); // For all financial movements

const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get currency from settings (async virtuals need this in controllers)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('../models/Settings').schema);
    appSettings = await Settings.findById('app_settings');
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

// @desc    Get all users - filtered based on user role and permissions
// @route   GET /api/users
// @access  Private (filterDataByRole middleware handles access)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const query = req.dataFilter || {}; // This will restrict users to user's groups/self

  const users = await User.find(query)
    .select('-password') // Exclude password hash
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
    .select('-password') // Exclude password hash
    .populate('groupRoles.groupId', 'name');

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Access control will be handled by authorizeOwnerOrAdmin middleware on the route
  res.status(200).json({ success: true, data: user });
});

// @desc    Update authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private (Self-service for authenticated user)
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };

  // Prevent direct updates to sensitive fields via this endpoint
  delete updates.role;
  delete updates.status;
  delete updates.password;
  delete updates.groupRoles; // Group roles should be managed via specific group endpoints

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    select: '-password', // Exclude password hash from response
  });

  if (!user) {
    return next(new ErrorResponse('User not found.', 404)); // Should not happen for req.user.id
  }

  res
    .status(200)
    .json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
});

// @desc    Update a user's global role or status (Admin/Officer only)
// @route   PUT /api/users/:id/role-status
// @access  Private (Admin, Officer) - authorize('admin', 'officer') middleware
exports.updateUserRoleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Validate inputs
  if (role && !['admin', 'officer', 'leader', 'member'].includes(role)) {
    return next(new ErrorResponse('Invalid role provided.', 400));
  }
  if (
    status &&
    !['active', 'inactive', 'pending', 'suspended'].includes(status)
  ) {
    return next(new ErrorResponse('Invalid status provided.', 400));
  }

  // Apply updates
  if (role) user.role = role;
  if (status) user.status = status;

  await user.save();

  res
    .status(200)
    .json({
      success: true,
      message: 'User role/status updated successfully.',
      data: user,
    });
});

// @desc    Delete a user (Admin/Officer only)
// @route   DELETE /api/users/:id
// @access  Private (Admin, Officer) - authorize('admin', 'officer') middleware
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Prevent deleting self for admin/officer, or deleting primary admin
  if (
    user._id.toString() === req.user.id &&
    (req.user.role === 'admin' || req.user.role === 'officer')
  ) {
    return next(
      new ErrorResponse(
        'Admins/Officers cannot delete their own account via this endpoint.',
        403
      )
    );
  }

  // Option: Consider soft deleting user accounts instead of hard deleting for auditability
  // user.deleted = true;
  // user.deletedAt = new Date();
  // await user.save();
  await user.deleteOne(); // For now, proceeding with hard delete as per original intent

  res
    .status(200)
    .json({ success: true, message: 'User deleted successfully.' });
});

// @desc    Get user's groups
// @route   GET /api/users/:userId/groups (admin/officer can query any user's groups)
// @route   GET /api/users/me/groups (user can query their own groups)
// @access  Private (authorizeUserAccess middleware for userId, then filterDataByRole for groups)
exports.getUserGroups = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  // Middleware authorizeUserAccess will ensure req.user.id matches userId or req.user is admin/officer.
  // So, no explicit role check needed here.

  // Get groups where user is a member or created by
  const groups = await Group.find({
    $or: [{ members: userId }, { createdBy: userId }],
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

  // Access control will be handled by authorizeGroupAccess middleware on the route
  // It ensures req.user has access to this group (member, leader, admin, officer).

  // Get group members with their global and group-specific roles
  const members = await User.find({
    _id: { $in: group.members }, // Find users whose IDs are in the group's members array
  }).select('name email role status groupRoles');

  // Filter group roles for each member to only show the relevant group
  const filteredMembers = members.map(member => {
    const groupRole = member.groupRoles.find(
      gr => gr.groupId.toString() === groupId
    );
    return {
      _id: member._id,
      name: member.name,
      email: member.email,
      globalRole: member.role, // Renamed to clarify it's the global role
      globalStatus: member.status, // Renamed to clarify it's the global status
      groupRole: groupRole ? groupRole.role : 'member', // Default to 'member' if no explicit role
      groupStatus: groupRole ? groupRole.status : 'active', // Default to 'active'
    };
  });

  res
    .status(200)
    .json({
      success: true,
      count: filteredMembers.length,
      data: filteredMembers,
    });
});

// @desc    Update group member's group-specific role and permissions
// @route   PUT /api/groups/:groupId/members/:memberId/role
// @access  Private (Admin, Officer, or Group Leader) - authorize('admin', 'officer', 'groupLeader') middleware
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

  // Role validation
  const validGroupRoles = ['member', 'secretary', 'treasurer', 'chairman']; // Define valid group-specific roles
  if (role && !validGroupRoles.includes(role)) {
    return next(
      new ErrorResponse(
        `Invalid group role. Must be one of: ${validGroupRoles.join(', ')}.`,
        400
      )
    );
  }

  const user = await User.findById(memberId);
  if (!user) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  // Check if the user is actually a member of the group
  const group = await Group.findById(groupId).select('members');
  if (!group || !group.members.includes(user._id)) {
    return next(
      new ErrorResponse(
        'User is not a member of this group or group not found.',
        400
      )
    );
  }

  // Access control handled by authorize middleware on the route (admin, officer, groupLeader)
  // No need for in-line checks here, as it's the middleware's responsibility.

  // Update or add group role entry for the user
  const existingRoleIndex = user.groupRoles.findIndex(
    gr => gr.groupId.toString() === groupId
  );

  if (existingRoleIndex >= 0) {
    if (role) user.groupRoles[existingRoleIndex].role = role;
    if (permissions)
      user.groupRoles[existingRoleIndex].permissions = permissions;
  } else {
    // This case should ideally not happen if user is already a member,
    // as they should have a default groupRole upon joining.
    // However, if adding a new role, ensure it's linked to the group.
    user.groupRoles.push({
      groupId: new mongoose.Types.ObjectId(groupId), // Ensure it's an ObjectId
      role: role || 'member', // Default to 'member' if role not provided
      permissions: permissions || [],
      status: 'active',
    });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully',
    data: user.toObject({ virtuals: true }), // Return user with updated roles
  });
});

// @desc    Update group member's group-specific status
// @route   PUT /api/groups/:groupId/members/:memberId/status
// @access  Private (Admin, Officer, or Group Leader) - authorize('admin', 'officer', 'groupLeader') middleware
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

  // Status validation
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

  // Check if the user is actually a member of the group
  const group = await Group.findById(groupId).select('members');
  if (!group || !group.members.includes(user._id)) {
    return next(
      new ErrorResponse(
        'User is not a member of this group or group not found.',
        400
      )
    );
  }

  // Access control handled by authorize middleware on the route (admin, officer, groupLeader)

  // Update group role status
  const groupRoleIndex = user.groupRoles.findIndex(
    gr => gr.groupId.toString() === groupId
  );

  if (groupRoleIndex >= 0) {
    user.groupRoles[groupRoleIndex].status = status;
  } else {
    return next(
      new ErrorResponse('User is not assigned a role in this group.', 400)
    );
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Member status updated successfully',
    data: user.toObject({ virtuals: true }),
  });
});

// @desc    Add member to group
// @route   POST /api/groups/:groupId/members
// @access  Private (Admin, Officer, or Group Leader) - authorize('admin', 'officer', 'groupLeader') middleware
exports.addMemberToGroup = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  const { email } = req.body; // Or memberId if you prefer

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid group ID format.', 400));
  }
  if (!email) {
    return next(new ErrorResponse('Member email is required.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('User with this email not found.', 404));
  }

  // Check if user is already a member
  if (group.members.includes(user._id)) {
    return next(
      new ErrorResponse('User is already a member of this group.', 400)
    );
  }

  // Access control handled by authorize middleware on the route

  // Add user to group's members array
  group.members.push(user._id);
  await group.save();

  // Add default 'member' group role to user if they don't have one for this group
  const existingRoleIndex = user.groupRoles.findIndex(
    gr => gr.groupId.toString() === groupId
  );
  if (existingRoleIndex === -1) {
    user.groupRoles.push({
      groupId: new mongoose.Types.ObjectId(groupId),
      role: 'member', // Default role upon joining
      permissions: [],
      status: 'active',
    });
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Member added successfully to group.',
    data: { groupId: group._id, memberId: user._id, memberName: user.name },
  });
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:groupId/members/:memberId
// @access  Private (Admin, Officer, or Group Leader) - authorize('admin', 'officer', 'groupLeader') middleware
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

  // Access control handled by authorize middleware on the route

  // Remove user from group's members array
  const initialMemberCount = group.members.length;
  group.members = group.members.filter(id => id.toString() !== memberId);
  if (group.members.length === initialMemberCount) {
    return next(new ErrorResponse('User is not a member of this group.', 400));
  }
  await group.save();

  // Remove group role from user's groupRoles array
  const user = await User.findById(memberId);
  if (user) {
    user.groupRoles = user.groupRoles.filter(
      gr => gr.groupId.toString() !== groupId
    );
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Member removed successfully from group.',
  });
});

// @desc    Get user's financial summary
// @route   GET /api/users/:userId/financial-summary
// @route   GET /api/users/me/financial-summary
// @access  Private (authorizeUserAccess middleware handles access)
exports.getUserFinancialSummary = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId === 'me' ? req.user.id : req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  // Access control handled by authorizeUserAccess middleware

  const currency = await getCurrency();

  // Get user's primary savings account balance
  const userSavingsAccount = await Account.findOne({
    owner: userId,
    ownerModel: 'User',
    type: 'savings',
  });
  const totalSavings = userSavingsAccount ? userSavingsAccount.balance : 0;

  // Get loans associated with the user as borrower
  const userLoans = await Loan.find({
    borrower: userId,
    borrowerModel: 'User',
  });
  let totalLoansApproved = 0;
  let totalLoansPending = 0;
  let totalOutstandingLoanBalance = 0;

  userLoans.forEach(loan => {
    if (loan.status === 'approved') {
      totalLoansApproved += loan.amountApproved;
      totalOutstandingLoanBalance += loan.currentBalance; // Assuming currentBalance is maintained
    } else if (loan.status === 'pending') {
      totalLoansPending += loan.amountRequested;
    }
  });

  // Get user's transactions (deposits, withdrawals, loan repayments)
  const userTransactions = await Transaction.find({
    member: userId,
    deleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(10); // Last 10 transactions for history

  // Populate and format recent transactions
  const formattedTransactions = await Promise.all(
    userTransactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      obj.formattedAmount = await tx.formattedAmount;
      return obj;
    })
  );

  // Get groups the user is a member of or created
  const groups = await Group.find({
    $or: [{ members: userId }, { createdBy: userId }],
  }).select('name members createdBy');

  // Summarize group financial data (for groups where user is member/leader)
  const groupSummaries = await Promise.all(
    groups.map(async group => {
      const groupSavingsAccount = await Account.findOne({
        owner: group._id,
        ownerModel: 'Group',
        type: 'group_savings',
      });
      const groupLoans = await Loan.find({ group: group._id });

      let groupTotalSavings = groupSavingsAccount
        ? groupSavingsAccount.balance
        : 0;
      let groupTotalLoansApproved = 0;
      let groupTotalOutstandingLoans = 0;

      groupLoans.forEach(loan => {
        if (loan.status === 'approved') {
          groupTotalLoansApproved += loan.amountApproved;
          groupTotalOutstandingLoans += loan.currentBalance;
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
      },
      recentTransactions: formattedTransactions,
      groupFinancialOverview: groupSummaries,
    },
  });
});
