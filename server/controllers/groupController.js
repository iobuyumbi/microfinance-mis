// server/controllers/groupController.js
// Handles all group CRUD operations (create, read, update, delete)
const Group = require('../models/Group');
const User = require('../models/User');
const Account = require('../models/Account');
const UserGroupMembership = require('../models/UserGroupMembership');
const asyncHandler = require('../middleware/asyncHandler');
const {
  ErrorResponse,
  settingsHelper,
  generateAccountNumber,
} = require('../utils');
const mongoose = require('mongoose');

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/**
 * Create a new group
 * Route: POST /api/groups
 * Access: Private (Admin, Officer)
 * Creates a new group and assigns a leader.
 */
exports.createGroup = asyncHandler(async (req, res, next) => {
  const { name, location, meetingFrequency, description, leaderId } = req.body;

  if (!name || !location || !leaderId) {
    // meetingFrequency and description are optional
    return next(
      new ErrorResponse(
        'Group name, location, and leader ID are required.',
        400
      )
    );
  }
  if (!isValidObjectId(leaderId)) {
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
          status: 'active',
        },
      ],
      { session }
    );

    const newGroup = group[0]; // Mongoose.create returns an array

    // 2. Create a default savings account for the group
    const accountNumber = await generateAccountNumber();
    const groupAccount = await Account.create(
      [
        {
          owner: newGroup._id,
          ownerModel: 'Group',
          balance: 0,
          accountNumber: accountNumber,
          type: 'savings',
          status: 'active',
        },
      ],
      { session }
    );
    newGroup.account = groupAccount[0]._id; // Link account to group
    await newGroup.save({ session }); // Save group with account ID

    // 3. Create UserGroupMembership for the leader
    await UserGroupMembership.create(
      [
        {
          user: leaderId,
          group: newGroup._id,
          roleInGroup: 'leader',
          status: 'active',
          joinedDate: new Date(),
        },
      ],
      { session }
    );

    // 4. Ensure the leader's global role is 'leader' and isMember is true
    if (leaderUser.role !== 'leader' || !leaderUser.isMember) {
      leaderUser.role = 'leader';
      leaderUser.isMember = true;
      await leaderUser.save({ session });
    }

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

/**
 * Get all groups - filtered based on user role and membership
 * Route: GET /api/groups
 * Access: Private (Admin, Officer sees all; Leader/Member sees their groups)
 * Returns a list of all groups, populated with leader and account details.
 */
exports.getGroups = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
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

/**
 * Get a group by ID - accessible to members or admin/officer
 * Route: GET /api/groups/:id
 * Access: Private (authorizeGroupAccess middleware handles access)
 * Returns a single group, populated with leader, account, and active members.
 */
exports.getGroupById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  // Use req.dataFilter for access control
  const query = { _id: id, ...(req.dataFilter || {}) };

  const group = await Group.findOne(query)
    .populate('leader', 'name email')
    .populate('account');

  if (!group) {
    return next(
      new ErrorResponse('Group not found or you do not have access.', 404)
    );
  }

  // Also populate active members of the group via UserGroupMembership
  const activeMemberships = await UserGroupMembership.find({
    group: group._id,
    status: 'active',
  })
    .populate('user', 'name email phone nationalID role status')
    .select('user roleInGroup joinedDate');

  const members = activeMemberships.map(m => ({
    ...m.user.toObject(),
    roleInGroup: m.roleInGroup,
    joinedDate: m.joinedDate,
    membershipId: m._id,
  }));

  res.status(200).json({
    success: true,
    data: { ...group.toObject(), members },
  });
});

/**
 * Update group details - only by admins, officers, or group leaders with permission
 * Route: PUT /api/groups/:id
 * Access: Private (authorizeGroupPermission('can_edit_group_profile') middleware handles access)
 * Allows updating group details, including leader.
 */
exports.updateGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  // Use req.dataFilter for access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  let group = await Group.findOne(query);

  if (!group) {
    return next(
      new ErrorResponse(
        'Group not found or you do not have permission to update.',
        404
      )
    );
  }

  const { name, location, meetingFrequency, description, leaderId, status } =
    req.body;

  // Update allowed fields if provided
  if (name !== undefined) group.name = name;
  if (location !== undefined) group.location = location;
  if (meetingFrequency !== undefined) group.meetingFrequency = meetingFrequency;
  if (description !== undefined) group.description = description;
  if (status !== undefined) group.status = status;

  // Handle changing leader
  if (leaderId && leaderId.toString() !== group.leader.toString()) {
    if (!isValidObjectId(leaderId)) {
      return next(new ErrorResponse('Invalid new Leader ID format.', 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newLeader = await User.findById(leaderId).session(session);
      if (!newLeader) {
        throw new ErrorResponse('New leader user not found.', 404);
      }

      // Find or create membership for the new leader
      let newLeaderMembership = await UserGroupMembership.findOne({
        user: newLeader._id,
        group: group._id,
      }).session(session);

      if (newLeaderMembership) {
        // Reactivate if inactive, update role to leader
        newLeaderMembership.status = 'active';
        newLeaderMembership.roleInGroup = 'leader';
        newLeaderMembership.leftDate = undefined; // Clear left date if reactivating
        await newLeaderMembership.save({ session });
      } else {
        // Create new membership for the new leader
        newLeaderMembership = await UserGroupMembership.create(
          [
            {
              user: newLeader._id,
              group: group._id,
              roleInGroup: 'leader',
              status: 'active',
              joinedDate: new Date(),
            },
          ],
          { session }
        );
        newLeaderMembership = newLeaderMembership[0]; // Access the created document
      }

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
        oldLeaderMembership.roleInGroup = 'member'; // Demote to regular member
        await oldLeaderMembership.save({ session });
      }

      group.leader = leaderId; // Update group's leader field
      await group.save({ session }); // Save group with new leader

      // Ensure new leader's global role is 'leader'
      if (newLeader.role !== 'leader' || !newLeader.isMember) {
        newLeader.role = 'leader';
        newLeader.isMember = true;
        await newLeader.save({ session });
      }
      // Consider demoting old leader's global role if they are no longer a leader of any group
      // This is complex and might need a separate helper function or background job.

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

  // Populate leader and account for response
  await group.populate('leader', 'name email');
  await group.populate('account');

  res.status(200).json({
    success: true,
    message: 'Group updated successfully.',
    data: group,
  });
});

/**
 * Delete a group - only by admins or officers
 * Route: DELETE /api/groups/:id
 * Access: Private (Admin, Officer)
 * Soft deletes a group and its associated data (memberships, accounts, loans, meetings).
 */
exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  const group = await Group.findById(id);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete the group
    group.status = 'inactive';
    group.deletedAt = new Date();
    group.deletedBy = req.user.id;
    await group.save({ session });

    // Mark associated accounts as inactive
    await Account.updateMany(
      { owner: id, ownerModel: 'Group' },
      { status: 'inactive' },
      { session }
    );

    // Mark all active group memberships as inactive
    await UserGroupMembership.updateMany(
      { group: id, status: 'active' },
      { status: 'inactive', leftDate: Date.now() },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Group soft-deleted successfully.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error soft-deleting group:', error);
    return next(new ErrorResponse('Failed to soft delete group.', 500));
  }
});
