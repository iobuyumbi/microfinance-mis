// server\controllers\groupController.js (REVISED)
const Group = require('../models/Group');
const User = require('../models/User'); // Still needed to find users
const Account = require('../models/Account');
const UserGroupMembership = require('../models/UserGroupMembership');
const CustomGroupRole = require('../models/CustomGroupRole');
// You will also need Loan, Transaction, Meeting models for comprehensive cascading deletes
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Meeting = require('../models/Meeting');

const { asyncHandler } = require('../middleware');
const { ErrorResponse } = require('../utils');
const mongoose = require('mongoose');

// Helper to get default permissions for different role types
const getDefaultPermissions = roleType => {
  const permissions = {
    member: [
      'view_group_info',
      'view_group_members',
      'view_group_meetings',
      'view_own_contributions',
      'make_contributions',
      'view_own_loans',
      'apply_for_loans',
    ],
    leader: [
      'view_group_info',
      'view_group_members',
      'view_group_meetings',
      'view_own_contributions',
      'make_contributions',
      'view_own_loans',
      'apply_for_loans',
      'can_edit_group_info',
      'can_manage_members',
      'can_manage_roles',
      'can_manage_meetings',
      'can_manage_contributions',
      'can_manage_loans',
      'can_view_reports',
      'can_create_group', // Leader can create new groups if system allows
    ],
    // You can add more predefined role types here like 'secretary', 'treasurer'
    secretary: [
      'view_group_info',
      'view_group_members',
      'view_group_meetings',
      'can_manage_meetings',
      'can_view_reports',
    ],
    treasurer: [
      'view_group_info',
      'view_group_members',
      'view_own_contributions',
      'can_manage_contributions',
      'can_manage_loans',
      'can_view_reports',
    ],
  };
  return permissions[roleType] || permissions.member;
};

// Helper to get CustomGroupRole by name for a specific group
const getCustomGroupRoleByName = async (groupId, roleName, session = null) => {
  const role = await CustomGroupRole.findOne({
    group: groupId,
    name: roleName,
    isActive: true,
  }).session(session);
  if (!role) {
    throw new ErrorResponse(
      `Default group role '${roleName}' not found for group ${groupId}.`,
      500
    );
  }
  return role;
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (Admin, Officer)
exports.createGroup = asyncHandler(async (req, res, next) => {
  const { name, location, meetingFrequency, description, leaderId } = req.body;

  if (!name || !location || !meetingFrequency || !leaderId) {
    return next(
      new ErrorResponse(
        'Group name, location, meeting frequency, description, and leader ID are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(leaderId)) {
    return next(new ErrorResponse('Invalid Leader ID format.', 400));
  }

  const leaderUser = await User.findById(leaderId);
  if (!leaderUser) {
    return next(new ErrorResponse('Specified leader not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create the Group
    const group = await Group.create(
      [
        {
          name,
          location,
          meetingFrequency,
          description,
          leader: leaderId,
          createdBy: req.user._id,
          members: [leaderId], // Add leader as initial member (denormalized for quick lookup)
          status: 'active',
        },
      ],
      { session }
    );

    const newGroup = group[0]; // Mongoose.create returns an array

    // 2. Create a default savings account for the group
    const groupAccount = await Account.create(
      [
        {
          owner: newGroup._id,
          ownerModel: 'Group',
          balance: 0,
          accountNumber: `GRP-${newGroup._id.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
          type: 'savings',
          createdBy: req.user._id,
        },
      ],
      { session }
    );
    newGroup.account = groupAccount[0]._id; // Link account to group
    await newGroup.save({ session }); // Save group with account ID

    // 3. Create default CustomGroupRoles for this new group
    const defaultMemberRole = await CustomGroupRole.create(
      [
        {
          group: newGroup._id,
          name: 'Member',
          description: 'Standard group member with basic permissions.',
          permissions: getDefaultPermissions('member'),
          createdBy: req.user._id,
          isActive: true,
        },
      ],
      { session }
    );

    const defaultLeaderRole = await CustomGroupRole.create(
      [
        {
          group: newGroup._id,
          name: 'Leader',
          description: 'Primary group leader with management permissions.',
          permissions: getDefaultPermissions('leader'),
          createdBy: req.user._id,
          isActive: true,
        },
      ],
      { session }
    );

    // 4. Create UserGroupMembership for the leader
    await UserGroupMembership.create(
      [
        {
          user: leaderId,
          group: newGroup._id,
          groupRole: defaultLeaderRole[0]._id, // Assign the leader role
          status: 'active',
          joinedDate: new Date(),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate leader and account for response
    await newGroup.populate('leader', 'name email');
    await newGroup.populate('account');

    res.status(201).json({
      success: true,
      message: 'Group created successfully with initial leader and account.',
      data: newGroup,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating group:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    next(new ErrorResponse('Failed to create group. ' + error.message, 500));
  }
});

// @desc    Get all groups - filtered based on user role and membership
// @route   GET /api/groups
// @access  Private (Admin, Officer sees all; Leader/Member sees their groups)
exports.getAllGroups = asyncHandler(async (req, res, next) => {
  const groups = await Group.find(req.dataFilter || {})
    .populate('leader', 'name email')
    .populate('account')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: groups.length,
    data: groups,
  });
});

// @desc    Get a group by ID - accessible to members or admin/officer
// @route   GET /api/groups/:id
// @access  Private (authorizeGroupAccess middleware handles access)
exports.getGroupById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const group = await Group.findById(id)
    .populate('leader', 'name email')
    .populate('account');

  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: group,
  });
});

// @desc    Update group details - only by admins, officers, or group leaders with permission
// @route   PUT /api/groups/:id
// @access  Private (authorizeGroupPermission('can_edit_group_profile') middleware handles access)
exports.updateGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  let group = await Group.findById(id);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const { name, location, meetingFrequency, description, leaderId } = req.body;

  // Update allowed fields if provided
  if (name) group.name = name;
  if (location) group.location = location;
  if (meetingFrequency) group.meetingFrequency = meetingFrequency;
  if (description) group.description = description;

  // Handle changing leader
  if (leaderId && leaderId.toString() !== group.leader.toString()) {
    if (!mongoose.Types.ObjectId.isValid(leaderId)) {
      return next(new ErrorResponse('Invalid new Leader ID format.', 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newLeader = await User.findById(leaderId).session(session);
      if (!newLeader) {
        throw new ErrorResponse('New leader user not found.', 404);
      }

      // Ensure new leader is an active member and assign leader role
      const newLeaderMembership = await UserGroupMembership.findOne({
        user: newLeader._id,
        group: group._id,
        status: 'active',
      }).session(session);

      if (!newLeaderMembership) {
        throw new ErrorResponse(
          'New leader must be an active member of the group first.',
          400
        );
      }

      const defaultLeaderRole = await getCustomGroupRoleByName(
        group._id,
        'Leader',
        session
      );
      newLeaderMembership.groupRole = defaultLeaderRole._id;
      await newLeaderMembership.save({ session });

      // Demote the old leader's group role if they are not the new leader
      const oldLeaderMembership = await UserGroupMembership.findOne({
        user: group.leader,
        group: group._id,
        status: 'active',
      }).session(session);

      if (
        oldLeaderMembership &&
        oldLeaderMembership.user.toString() !== newLeader._id.toString()
      ) {
        const defaultMemberRole = await getCustomGroupRoleByName(
          group._id,
          'Member',
          session
        );
        oldLeaderMembership.groupRole = defaultMemberRole._id;
        await oldLeaderMembership.save({ session });
      }

      group.leader = leaderId; // Update group's leader field
      await group.save({ session });

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error updating group leader:', error);
      if (error instanceof ErrorResponse) return next(error); // Pass custom errors
      next(
        new ErrorResponse(
          'Failed to update group leader. ' + error.message,
          500
        )
      );
    }
  }

  await group.save(); // Save group (for name, location, etc. updates if not handled in leader change transaction)

  await group.populate('leader', 'name email');
  await group.populate('account');

  res.status(200).json({
    success: true,
    message: 'Group updated successfully.',
    data: group,
  });
});

// @desc    Delete a group - only by admins or officers
// @route   DELETE /api/groups/:id
// @access  Private (Admin, Officer) - authorize middleware handles this
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const group = await Group.findById(id);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // --- IMPORTANT: Implement transactional soft delete for data integrity ---
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Soft delete the Group itself
    group.status = 'deleted'; // Add 'deleted' to your Group model's status enum
    group.deletedAt = new Date();
    group.deletedBy = req.user.id;
    await group.save({ session });

    // 2. Inactivate all UserGroupMembership documents for this group
    await UserGroupMembership.updateMany(
      { group: id },
      { status: 'inactive', removedAt: new Date(), removedBy: req.user.id },
      { session }
    );

    // 3. Inactivate the group's main Account
    if (group.account) {
      await Account.findByIdAndUpdate(
        group.account,
        { status: 'inactive' },
        { session }
      );
    }

    // 4. Inactivate/handle related CustomGroupRoles
    // It's safer to inactivate them than delete, in case you need audit or restore
    await CustomGroupRole.updateMany(
      { group: id },
      { isActive: false },
      { session }
    );

    // 5. Critical: Handle financial data (Loans, Transactions)
    // You generally do NOT delete financial records. Instead, mark them.
    // Option A: Mark associated loans/transactions as related to a 'deleted' group.
    await Loan.updateMany(
      { group: id, status: { $ne: 'completed' } }, // Only outstanding loans
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: req.user.id,
      },
      { session }
    );
    // Transactions usually remain as-is for audit, but could be flagged.
    // await Transaction.updateMany({ group: id }, { isGroupDeleted: true }, { session });

    // 6. Handle other related entities (e.g., Meetings, Notifications)
    await Meeting.updateMany(
      { group: id },
      { status: 'cancelled', cancelledAt: new Date() },
      { session }
    );
    // Notifications might be deleted or flagged
    // await Notification.deleteMany({ group: id }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Group and associated data soft-deleted successfully.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error soft-deleting group:', error);
    return next(
      new ErrorResponse('Failed to soft delete group. ' + error.message, 500)
    );
  }
});

// @desc    Add a member to a group
// @route   POST /api/groups/:id/members
// @access  Private (authorizeGroupPermission('can_manage_members') or Admin/Officer)
exports.addMember = asyncHandler(async (req, res, next) => {
  const { id: groupId } = req.params;
  const { userId, groupRoleName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ErrorResponse('Invalid User ID format.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const userToAdd = await User.findById(userId);
  if (!userToAdd) {
    return next(new ErrorResponse('User to add not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user is already an active member of this group via UserGroupMembership
    let existingMembership = await UserGroupMembership.findOne({
      user: userId,
      group: groupId,
    }).session(session);

    if (existingMembership && existingMembership.status === 'active') {
      throw new ErrorResponse(
        'User is already an active member of this group.',
        400
      );
    }

    const roleToAssignName = groupRoleName || 'Member';
    const customGroupRole = await getCustomGroupRoleByName(
      groupId,
      roleToAssignName,
      session
    );

    if (existingMembership) {
      // Reactivate existing membership
      existingMembership.groupRole = customGroupRole._id;
      existingMembership.status = 'active';
      existingMembership.removedAt = undefined; // Clear removal flags
      existingMembership.removedBy = undefined;
      existingMembership.joinedDate = new Date();
      await existingMembership.save({ session });
    } else {
      // Create new UserGroupMembership
      existingMembership = await UserGroupMembership.create(
        [
          {
            user: userId,
            group: groupId,
            groupRole: customGroupRole._id,
            status: 'active',
            joinedDate: new Date(),
          },
        ],
        { session }
      );
      existingMembership = existingMembership[0]; // Access the created document
    }

    // Add user to the Group's 'members' array for quick lookup (denormalization)
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await existingMembership.populate('user', 'name email');
    await existingMembership.populate('group', 'name');
    await existingMembership.populate('groupRole', 'name');

    res.status(200).json({
      success: true,
      message: `Member ${userToAdd.name} added to group ${group.name} with role ${customGroupRole.name}.`,
      data: existingMembership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding member to group:', error);
    if (error instanceof ErrorResponse) return next(error);
    next(
      new ErrorResponse('Failed to add member to group. ' + error.message, 500)
    );
  }
});

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (authorizeGroupPermission('can_manage_members') or Admin/Officer)
exports.removeMember = asyncHandler(async (req, res, next) => {
  const { id: groupId, userId } = req.params; // Group ID and User ID from URL
  const { newLeaderId } = req.body; // Optional: for transferring leadership if current leader is removed

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(new ErrorResponse('Invalid User ID format.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const membershipToRemove = await UserGroupMembership.findOne({
      user: userId,
      group: groupId,
      status: 'active',
    }).session(session);

    if (!membershipToRemove) {
      throw new ErrorResponse(
        'User is not an active member of this group.',
        400
      );
    }

    // Prevent removing the group leader without transferring leadership
    if (group.leader.toString() === userId.toString()) {
      if (!newLeaderId) {
        throw new ErrorResponse(
          'Cannot remove group leader without specifying a new leader.',
          400
        );
      }
      if (!mongoose.Types.ObjectId.isValid(newLeaderId)) {
        throw new ErrorResponse('Invalid New Leader ID format.', 400);
      }
      if (newLeaderId.toString() === userId.toString()) {
        throw new ErrorResponse(
          'New leader cannot be the same as the member being removed.',
          400
        );
      }

      // Transfer leadership
      const newLeaderMembership = await UserGroupMembership.findOne({
        user: newLeaderId,
        group: groupId,
        status: 'active',
      }).session(session);
      if (!newLeaderMembership) {
        throw new ErrorResponse(
          'New leader must be an active member of the group.',
          400
        );
      }
      const defaultLeaderRole = await getCustomGroupRoleByName(
        groupId,
        'Leader',
        session
      );
      newLeaderMembership.groupRole = defaultLeaderRole._id;
      await newLeaderMembership.save({ session });

      group.leader = newLeaderId; // Update group's leader field
      await group.save({ session });
    }

    // Optional: Perform financial checks before removal
    // If the user has an outstanding loan balance for this group, prevent removal
    // Or if the user has funds in a group-specific account, require withdrawal first
    const userAccountsInGroup = await Account.find({
      owner: userId,
      ownerModel: 'User',
      group: groupId, // Assuming group-specific accounts
      balance: { $gt: 0 },
    }).session(session);

    const outstandingLoansInGroup = await Loan.find({
      borrower: userId,
      group: groupId,
      currentBalance: { $gt: 0 },
    }).session(session);

    if (userAccountsInGroup.length > 0) {
      throw new ErrorResponse(
        'User has funds in group-specific accounts. Funds must be withdrawn before removal.',
        400
      );
    }
    if (outstandingLoansInGroup.length > 0) {
      throw new ErrorResponse(
        'User has outstanding loans in this group. Loans must be settled before removal.',
        400
      );
    }

    // Mark the UserGroupMembership record as inactive (soft removal)
    membershipToRemove.status = 'inactive';
    membershipToRemove.removedAt = new Date();
    membershipToRemove.removedBy = req.user.id; // Record who removed them
    await membershipToRemove.save({ session });

    // Remove user from the Group's 'members' array (denormalization)
    group.members = group.members.filter(
      m => m.toString() !== userId.toString()
    );
    await group.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Member ${userId} removed from group ${group.name}.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error removing member from group:', error);
    if (error instanceof ErrorResponse) return next(error);
    next(
      new ErrorResponse(
        'Failed to remove member from group. ' + error.message,
        500
      )
    );
  }
});

// @desc    Allow a user to join a group (self-service)
// @route   POST /api/groups/:id/join
// @access  Private (Authenticated User)
exports.joinGroup = asyncHandler(async (req, res, next) => {
  const { id: groupId } = req.params;
  const userId = req.user.id; // Current authenticated user

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user is already a member (active or inactive)
    let existingMembership = await UserGroupMembership.findOne({
      user: userId,
      group: groupId,
    }).session(session);

    if (existingMembership && existingMembership.status === 'active') {
      throw new ErrorResponse(
        'You are already an active member of this group.',
        400
      );
    }

    const defaultRole = await getCustomGroupRoleByName(
      groupId,
      'Member',
      session
    );

    if (existingMembership) {
      // Reactivate existing membership
      existingMembership.groupRole = defaultRole._id;
      existingMembership.status = 'active';
      existingMembership.removedAt = undefined;
      existingMembership.removedBy = undefined;
      existingMembership.joinedDate = new Date();
      await existingMembership.save({ session });
    } else {
      // Create new UserGroupMembership
      existingMembership = await UserGroupMembership.create(
        [
          {
            user: userId,
            group: groupId,
            groupRole: defaultRole._id,
            status: 'active',
            joinedDate: new Date(),
          },
        ],
        { session }
      );
      existingMembership = existingMembership[0]; // Access the created document
    }

    // Add user to the Group's 'members' array for quick lookup (denormalization)
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await existingMembership.populate('user', 'name email');
    await existingMembership.populate('group', 'name');
    await existingMembership.populate('groupRole', 'name');

    res.status(200).json({
      success: true,
      message: `Successfully joined group ${group.name} as a member.`,
      data: existingMembership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error joining group:', error);
    if (error instanceof ErrorResponse) return next(error);
    next(new ErrorResponse('Failed to join group. ' + error.message, 500));
  }
});

// @desc    Get members of a specific group with their roles
// @route   GET /api/groups/:groupId/members
// @access  Private (authorizeGroupAccess or Admin/Officer)
exports.getGroupMembers = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const memberships = await UserGroupMembership.find({
    group: groupId,
    status: 'active',
  })
    .populate('user', 'name email phone nationalID role status') // Populate user details
    .populate('groupRole', 'name description permissions'); // Populate the custom group role

  const membersWithRoles = memberships
    .map(membership => {
      if (!membership.user) return null;
      const memberObj = membership.user.toObject();
      memberObj.groupMembershipId = membership._id;
      memberObj.groupRole = membership.groupRole
        ? membership.groupRole.name
        : 'N/A';
      memberObj.groupPermissions = membership.groupRole
        ? membership.groupRole.permissions
        : [];
      memberObj.membershipStatus = membership.status;
      return memberObj;
    })
    .filter(m => m !== null);

  res.status(200).json({
    success: true,
    count: membersWithRoles.length,
    data: membersWithRoles,
  });
});

// @desc    Update a member's role within a group
// @route   PUT /api/groups/:groupId/members/:userId/role
// @access  Private (authorizeGroupPermission('can_manage_roles') or Admin/Officer)
exports.updateMemberRole = asyncHandler(async (req, res, next) => {
  const { groupId, userId } = req.params;
  const { newRoleName } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return next(new ErrorResponse('Invalid Group ID or User ID format.', 400));
  }
  if (
    !newRoleName ||
    typeof newRoleName !== 'string' ||
    newRoleName.trim() === ''
  ) {
    return next(new ErrorResponse('New role name is required.', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const membership = await UserGroupMembership.findOne({
      user: userId,
      group: groupId,
      status: 'active',
    }).session(session);

    if (!membership) {
      throw new ErrorResponse(
        'User is not an active member of this group.',
        404
      );
    }

    const newCustomRole = await getCustomGroupRoleByName(
      groupId,
      newRoleName.trim(),
      session
    );

    // If changing the group's current leader's role, ensure leadership is transferred first
    const group = await Group.findById(groupId)
      .session(session)
      .select('leader');
    if (
      group &&
      group.leader.toString() === userId.toString() &&
      newRoleName.trim() !== 'Leader'
    ) {
      throw new ErrorResponse(
        "Cannot change the current group leader's role directly. Please transfer leadership first.",
        400
      );
    }

    membership.groupRole = newCustomRole._id;
    await membership.save({ session });

    await session.commitTransaction();
    session.endSession();

    await membership.populate('user', 'name');
    await membership.populate('groupRole', 'name');

    res.status(200).json({
      success: true,
      message: `User ${membership.user.name} role updated to ${membership.groupRole.name} in group.`,
      data: membership,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating member role:', error);
    if (error instanceof ErrorResponse) return next(error);
    next(
      new ErrorResponse('Failed to update member role. ' + error.message, 500)
    );
  }
});

// Removed from here, as it's correctly placed in userController.js and groupService should not manage user-specific endpoints.
// exports.getUserGroups = asyncHandler(async (req, res, next) => { /* ... */ });
