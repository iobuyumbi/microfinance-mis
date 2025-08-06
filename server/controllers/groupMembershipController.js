// server/controllers/groupMembershipController.js
// Handles all group membership operations (add, remove, update role)
const Group = require('../models/Group');
const User = require('../models/User');
const UserGroupMembership = require('../models/UserGroupMembership');
const Loan = require('../models/Loan');
const Account = require('../models/Account');
const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse } = require('../utils');
const mongoose = require('mongoose');

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/**
 * Add a member to a group
 * Route: POST /api/members/:memberId/groups/:groupId
 * Access: Private (Admin, Officer)
 * Adds a user to a group, handles role assignment, and updates global roles.
 */
exports.addMemberToGroup = asyncHandler(async (req, res, next) => {
  const { memberId, groupId } = req.params; // Using memberId and groupId from URL params
  const { roleInGroup = 'member' } = req.body; // Default role if not provided

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (!isValidObjectId(memberId)) {
    return next(new ErrorResponse('Invalid User ID format.', 400));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const userToAdd = await User.findById(memberId);
  if (!userToAdd) {
    return next(new ErrorResponse('User to add not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user is already a member of this group via UserGroupMembership
    let existingMembership = await UserGroupMembership.findOne({
      user: memberId,
      group: groupId,
    }).session(session);

    if (existingMembership && existingMembership.status === 'active') {
      throw new ErrorResponse(
        'User is already an active member of this group.',
        400
      );
    }

    // Validate the requested roleInGroup
    const validRolesInGroup = ['member', 'leader', 'treasurer', 'secretary'];
    if (!validRolesInGroup.includes(roleInGroup)) {
      throw new ErrorResponse(
        `Invalid role in group: ${roleInGroup}. Must be one of: ${validRolesInGroup.join(', ')}.`,
        400
      );
    }

    if (existingMembership) {
      // Reactivate existing membership
      existingMembership.roleInGroup = roleInGroup; // Assign the specified role
      existingMembership.status = 'active';
      existingMembership.leftDate = undefined; // Clear removal flags
      existingMembership.joinedDate = new Date();
      await existingMembership.save({ session });
    } else {
      // Create new UserGroupMembership
      existingMembership = await UserGroupMembership.create(
        [
          {
            user: memberId,
            group: groupId,
            roleInGroup: roleInGroup,
            status: 'active',
            joinedDate: new Date(),
          },
        ],
        { session }
      );
      existingMembership = existingMembership[0]; // Access the created document
    }

    // Ensure the user's global role is at least 'member' if they are now part of a group
    if (userToAdd.role === 'user') {
      userToAdd.role = 'member';
      userToAdd.isMember = true;
      await userToAdd.save({ session });
    }
    // If the roleInGroup is 'leader', also update the user's global role
    if (roleInGroup === 'leader' && userToAdd.role !== 'leader') {
      userToAdd.role = 'leader';
      userToAdd.isMember = true;
      await userToAdd.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    await existingMembership.populate('user', 'name email');
    await existingMembership.populate('group', 'name');

    res.status(200).json({
      success: true,
      message: `Member ${userToAdd.name} added to group ${group.name} with role ${roleInGroup}.`,
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

/**
 * Remove a member from a group (soft remove membership)
 * Route: DELETE /api/members/:memberId/groups/:groupId
 * Access: Private (Admin, Officer)
 * Handles removing a member from a group, including leadership transfer if applicable.
 */
exports.removeMemberFromGroup = asyncHandler(async (req, res, next) => {
  const { groupId, memberId } = req.params; // Group ID and User ID from URL
  const { newLeaderId } = req.body; // Optional: for transferring leadership if current leader is removed

  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }
  if (!isValidObjectId(memberId)) {
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
      user: memberId,
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
    if (group.leader.toString() === memberId.toString()) {
      if (!newLeaderId) {
        throw new ErrorResponse(
          'Cannot remove group leader without specifying a new leader.',
          400
        );
      }
      if (!isValidObjectId(newLeaderId)) {
        throw new ErrorResponse('Invalid New Leader ID format.', 400);
      }
      if (newLeaderId.toString() === memberId.toString()) {
        throw new ErrorResponse(
          'New leader cannot be the same as the member being removed.',
          400
        );
      }

      // Transfer leadership
      let newLeaderMembership = await UserGroupMembership.findOne({
        user: newLeaderId,
        group: groupId,
      }).session(session);

      if (!newLeaderMembership || newLeaderMembership.status !== 'active') {
        throw new ErrorResponse(
          'New leader must be an active member of the group.',
          400
        );
      }

      newLeaderMembership.roleInGroup = 'leader'; // Assign 'leader' role
      await newLeaderMembership.save({ session });

      group.leader = newLeaderId; // Update group's leader field
      await group.save({ session });

      // Ensure new leader's global role is 'leader'
      const newLeaderUser = await User.findById(newLeaderId).session(session);
      if (
        newLeaderUser &&
        (newLeaderUser.role !== 'leader' || !newLeaderUser.isMember)
      ) {
        newLeaderUser.role = 'leader';
        newLeaderUser.isMember = true;
        await newLeaderUser.save({ session });
      }
    }

    // Optional: Perform financial checks before removal
    const userAccountsInGroup = await Account.find({
      owner: memberId,
      ownerModel: 'User',
      group: groupId, // Assuming group-specific accounts
      balance: { $gt: 0 },
    }).session(session);

    const outstandingLoansInGroup = await Loan.find({
      borrower: memberId,
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
    membershipToRemove.leftDate = new Date(); // Use leftDate
    await membershipToRemove.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: `Member ${memberId} removed from group ${group.name}.`,
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

/**
 * Update a member's role within a group
 * Route: PUT /api/members/:memberId/groups/:groupId/role
 * Access: Private (Admin, Officer)
 * Allows updating a member's role within a group, which also updates their global role.
 */
exports.updateMemberRoleInGroup = asyncHandler(async (req, res, next) => {
  const { groupId, memberId } = req.params;
  const { roleInGroup } = req.body; // Use roleInGroup as per UserGroupMembership model

  if (!isValidObjectId(groupId) || !isValidObjectId(memberId)) {
    return next(new ErrorResponse('Invalid Group ID or User ID format.', 400));
  }
  if (
    !roleInGroup ||
    typeof roleInGroup !== 'string' ||
    roleInGroup.trim() === ''
  ) {
    return next(new ErrorResponse('New role name is required.', 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const membership = await UserGroupMembership.findOne({
      user: memberId,
      group: groupId,
      status: 'active',
    }).session(session);

    if (!membership) {
      throw new ErrorResponse(
        'User is not an active member of this group.',
        404
      );
    }

    const validRolesInGroup = ['member', 'leader', 'treasurer', 'secretary'];
    if (!validRolesInGroup.includes(roleInGroup.trim())) {
      throw new ErrorResponse(
        `Invalid role in group: ${roleInGroup}. Must be one of: ${validRolesInGroup.join(', ')}.`,
        400
      );
    }

    // If changing the group's current leader's role, ensure leadership is transferred first
    const group = await Group.findById(groupId)
      .session(session)
      .select('leader');
    if (
      group &&
      group.leader.toString() === memberId.toString() &&
      roleInGroup.trim() !== 'leader'
    ) {
      throw new ErrorResponse(
        "Cannot change the current group leader's role directly. Please transfer leadership first.",
        400
      );
    }

    membership.roleInGroup = roleInGroup.trim();
    await membership.save({ session });

    // Update the user's global role if they are being promoted to leader
    if (roleInGroup.trim() === 'leader') {
      const user = await User.findById(memberId).session(session);
      if (user && (user.role === 'member' || user.role === 'user')) {
        user.role = 'leader';
        user.isMember = true;
        await user.save({ session });
      }
    } else {
      // If the user's role in this group is no longer 'leader',
      // consider if their global role should be demoted.
      // This is complex: check if they are a leader of *any other* group.
      // For now, we only promote, not automatically demote global role here.
    }

    await session.commitTransaction();
    session.endSession();

    await membership.populate('user', 'name');
    await membership.populate('group', 'name'); // Populate group name for response

    res.status(200).json({
      success: true,
      message: `User ${membership.user.name} role updated to ${membership.roleInGroup} in group ${membership.group.name}.`,
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

/**
 * Get members of a specific group with their roles
 * Route: GET /api/groups/:groupId/members
 * Access: Private (authorizeGroupAccess or Admin/Officer)
 * Returns a list of active members of a group, populated with their roles and join dates.
 */
exports.getGroupMembers = asyncHandler(async (req, res, next) => {
  const { groupId } = req.params;
  if (!isValidObjectId(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const memberships = await UserGroupMembership.find({
    group: groupId,
    status: 'active',
  })
    .populate('user', 'name email phone nationalID role status') // Populate user details
    .select('user roleInGroup joinedDate'); // Select relevant membership fields

  const membersWithRoles = memberships
    .map(membership => {
      if (!membership.user) return null; // Handle case where user might be deleted
      const memberObj = membership.user.toObject();
      memberObj.groupMembershipId = membership._id;
      memberObj.roleInGroup = membership.roleInGroup; // Directly use roleInGroup from membership
      memberObj.joinedDate = membership.joinedDate;
      return memberObj;
    })
    .filter(m => m !== null);

  res.status(200).json({
    success: true,
    count: membersWithRoles.length,
    data: membersWithRoles,
  });
});
