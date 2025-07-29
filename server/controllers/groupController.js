// server\controllers\groupController.js
const Group = require('../models/Group');
const User = require('../models/User');
const Account = require('../models/Account'); // To create group's account
const UserGroupMembership = require('../models/UserGroupMembership'); // New model for linking users to groups with roles
const CustomGroupRole = require('../models/CustomGroupRole'); // To assign default group roles
const asyncHandler = require('../middleware/asyncHandler'); // For error handling
const ErrorResponse = require('../utils/errorResponse'); // For custom error messages
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get default group role (e.g., 'member' or 'leader' CustomGroupRole for a new group)
// This will find the CustomGroupRole document that represents the default 'member' or 'leader' role for a given group.
const getDefaultCustomGroupRole = async (groupId, roleName) => {
    const defaultRole = await CustomGroupRole.findOne({
        group: groupId,
        name: roleName,
        isActive: true,
    });
    if (!defaultRole) {
        // This is a critical error: default roles should exist for every group
        const error = new Error(`Default group role '${roleName}' not found for group ${groupId}.`);
        error.statusCode = 500;
        throw error;
    }
    return defaultRole;
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (Admin, Officer) - or specific permission like 'can_create_group'
exports.createGroup = asyncHandler(async (req, res, next) => {
    // req.user is guaranteed to be present by 'protect' middleware
    const { name, location, meetingFrequency, description, leaderId } = req.body;

    // Basic validation
    if (!name || !location || !meetingFrequency || !leaderId) {
        return next(new ErrorResponse('Group name, location, meeting frequency, description, and leader ID are required.', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(leaderId)) {
        return next(new ErrorResponse('Invalid Leader ID format.', 400));
    }

    // Ensure the leader exists and is a 'leader' role or higher globally (optional, but good practice)
    const leaderUser = await User.findById(leaderId);
    if (!leaderUser) {
        return next(new ErrorResponse('Specified leader not found.', 404));
    }
    // You might want to enforce that only users with global role 'leader' or 'admin'/'officer' can be group leaders
    // if (!['leader', 'admin', 'officer'].includes(leaderUser.role)) {
    //     return next(new ErrorResponse('User specified as leader does not have the required system role.', 403));
    // }

    // Create the group
    const group = await Group.create({
        name,
        location,
        meetingFrequency,
        description,
        leader: leaderId, // Assign the leader
        createdBy: req.user._id, // User who created the group
        members: [leaderId], // Add leader as initial member in the quick lookup array
        status: 'active', // Default to active, or 'pending' if approval workflow
    });

    // --- Post-creation setup for the group ---

    // 1. Create a default savings account for the group (e.g., for group-level funds)
    const groupAccount = await Account.create({
        owner: group._id,
        ownerModel: 'Group',
        balance: 0,
        accountNumber: `GRP-${group._id.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
        type: 'savings', // Or 'operating_expense', 'loan_fund' etc.
    });
    group.account = groupAccount._id; // Link account to group
    await group.save(); // Save group with account ID

    // 2. Create default CustomGroupRoles for this new group
    // These are the 'templates' for roles within this specific group
    const defaultGroupMemberRole = await CustomGroupRole.create({
        group: group._id,
        name: 'Member',
        description: 'Standard group member with basic permissions.',
        permissions: getDefaultPermissions('member'), // Use system default member permissions
        createdBy: req.user._id,
    });

    const defaultGroupLeaderRole = await CustomGroupRole.create({
        group: group._id,
        name: 'Leader',
        description: 'Primary group leader with management permissions.',
        permissions: getDefaultPermissions('leader'), // Use system default leader permissions
        createdBy: req.user._id,
    });

    // 3. Create UserGroupMembership for the leader
    await UserGroupMembership.create({
        user: leaderId,
        group: group._id,
        groupRole: defaultGroupLeaderRole._id, // Assign the leader role
        status: 'active',
    });

    // Populate leader and account for response
    await group.populate('leader', 'name email');
    await group.populate('account');

    res.status(201).json({
        success: true,
        message: 'Group created successfully with initial leader and account.',
        data: group,
    });
});

// @desc    Get all groups - filtered based on user role and membership
// @route   GET /api/groups
// @access  Private (Admin, Officer sees all; Leader/Member sees their groups)
exports.getAllGroups = asyncHandler(async (req, res, next) => {
    // req.dataFilter is set by the filterDataByRole middleware
    const groups = await Group.find(req.dataFilter || {})
        .populate('leader', 'name email') // Populate the leader's info
        .populate('members', 'name email') // Populate members for quick view
        .populate('account') // Populate the group's account
        .sort({ name: 1 }); // Sort by group name

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
        .populate('members', 'name email')
        .populate('account');

    if (!group) {
        return next(new ErrorResponse('Group not found.', 404));
    }

    // Access check is handled by authorizeGroupAccess middleware before this controller runs
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

    // Update allowed fields
    group.name = req.body.name || group.name;
    group.location = req.body.location || group.location;
    group.meetingFrequency = req.body.meetingFrequency || group.meetingFrequency;
    group.description = req.body.description || group.description; // Added description update

    // Allow changing leader only if current user has appropriate permission (e.g., admin/officer or specific group permission)
    if (req.body.leaderId && req.body.leaderId.toString() !== group.leader.toString()) {
        if (!mongoose.Types.ObjectId.isValid(req.body.leaderId)) {
            return next(new ErrorResponse('Invalid new Leader ID format.', 400));
        }
        // This specific check would be done in a dedicated middleware or a more granular permission
        // For simplicity, we assume authorizeGroupPermission('can_manage_members') covers this.
        const newLeader = await User.findById(req.body.leaderId);
        if (!newLeader) {
            return next(new ErrorResponse('New leader user not found.', 404));
        }

        // Before changing leader, ensure new leader has a membership and assign leader role
        const newLeaderMembership = await UserGroupMembership.findOne({ user: newLeader._id, group: group._id, status: 'active' });
        if (!newLeaderMembership) {
            return next(new ErrorResponse('New leader must be an active member of the group first.', 400));
        }
        const defaultLeaderRole = await getDefaultCustomGroupRole(group._id, 'Leader');
        newLeaderMembership.groupRole = defaultLeaderRole._id;
        await newLeaderMembership.save();

        // Optionally, demote the old leader if they are not also a member
        const oldLeaderMembership = await UserGroupMembership.findOne({ user: group.leader, group: group._id, status: 'active' });
        if (oldLeaderMembership && oldLeaderMembership._id.toString() !== newLeaderMembership._id.toString()) {
             // Reassign old leader to a 'Member' role
             const defaultMemberRole = await getDefaultCustomGroupRole(group._id, 'Member');
             oldLeaderMembership.groupRole = defaultMemberRole._id;
             await oldLeaderMembership.save();
        }

        group.leader = req.body.leaderId;
    }

    await group.save();

    await group.populate('leader', 'name email');
    await group.populate('members', 'name email');
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

    // IMPORTANT: Implement cascading deletes or soft deletes for related data
    // This is a critical step to ensure data integrity.
    // For a real application, you would:
    // 1. Soft delete the group (recommended for audit trail) or hard delete.
    // 2. Delete all associated UserGroupMembership documents.
    // 3. Delete the group's Account document.
    // 4. Update/delete any Transactions, Loans, Meetings, Notifications linked to this group.

    // Example of soft delete:
    // group.status = 'inactive';
    // await group.save();
    // await UserGroupMembership.updateMany({ group: id }, { status: 'inactive' });
    // await Account.findByIdAndUpdate(group.account, { status: 'inactive' });

    // For now, performing a hard delete for simplicity, but be aware of implications.
    // Make sure to implement proper cascading logic in a service layer or pre-remove hooks.
    await group.deleteOne(); // Mongoose 6+ uses deleteOne()

    // Cascade delete related documents (simplified, for illustration)
    await UserGroupMembership.deleteMany({ group: id });
    if (group.account) {
        await Account.deleteOne({ _id: group.account });
    }
    // You'd also need to handle:
    // await Transaction.deleteMany({ group: id });
    // await Loan.deleteMany({ group: id });
    // await Meeting.deleteMany({ group: id });
    // await Notification.deleteMany({ group: id });
    // await CustomGroupRole.deleteMany({ group: id });


    res.status(200).json({
        success: true,
        message: 'Group and associated data deleted successfully.',
    });
});

// @desc    Add a member to a group
// @route   POST /api/groups/:id/members
// @access  Private (authorizeGroupPermission('can_manage_members') or Admin/Officer)
exports.addMember = asyncHandler(async (req, res, next) => {
    const { id: groupId } = req.params; // Group ID from URL
    const { userId, groupRoleName } = req.body; // User to add, and their desired role name

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

    // Check if user is already an active member of this group via UserGroupMembership
    const existingMembership = await UserGroupMembership.findOne({
        user: userId,
        group: groupId,
        status: 'active',
    });

    if (existingMembership) {
        return next(new ErrorResponse('User is already an active member of this group.', 400));
    }

    // Get the CustomGroupRole for this group. Default to 'Member' if not specified.
    const roleToAssignName = groupRoleName || 'Member';
    const customGroupRole = await CustomGroupRole.findOne({
        group: groupId,
        name: roleToAssignName,
        isActive: true, // Ensure the role is active
    });

    if (!customGroupRole) {
        return next(new ErrorResponse(`Custom group role '${roleToAssignName}' not found for this group.`, 404));
    }

    // Create the UserGroupMembership
    const newMembership = await UserGroupMembership.create({
        user: userId,
        group: groupId,
        groupRole: customGroupRole._id,
        status: 'active',
    });

    // Add user to the Group's 'members' array for quick lookup (denormalization)
    if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
    }

    // Populate for response
    await newMembership.populate('user', 'name email');
    await newMembership.populate('group', 'name');
    await newMembership.populate('groupRole', 'name');


    res.status(200).json({
        success: true,
        message: `Member ${userToAdd.name} added to group ${group.name} with role ${customGroupRole.name}.`,
        data: newMembership,
    });
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

    // Find the membership to be removed
    const membershipToRemove = await UserGroupMembership.findOne({
        user: userId,
        group: groupId,
        status: 'active',
    });

    if (!membershipToRemove) {
        return next(new ErrorResponse('User is not an active member of this group.', 400));
    }

    // Prevent removing the group leader without transferring leadership
    if (group.leader.toString() === userId.toString()) {
        if (!newLeaderId) {
            return next(new ErrorResponse('Cannot remove group leader without specifying a new leader.', 400));
        }
        if (!mongoose.Types.ObjectId.isValid(newLeaderId)) {
            return next(new ErrorResponse('Invalid New Leader ID format.', 400));
        }
        if (newLeaderId.toString() === userId.toString()) {
            return next(new ErrorResponse('New leader cannot be the same as the member being removed.', 400));
        }

        // Transfer leadership
        const newLeaderMembership = await UserGroupMembership.findOne({ user: newLeaderId, group: groupId, status: 'active' });
        if (!newLeaderMembership) {
            return next(new ErrorResponse('New leader must be an active member of the group.', 400));
        }
        const defaultLeaderRole = await getDefaultCustomGroupRole(groupId, 'Leader');
        newLeaderMembership.groupRole = defaultLeaderRole._id;
        await newLeaderMembership.save();

        group.leader = newLeaderId; // Update group's leader field
        await group.save();
    }

    // Delete the UserGroupMembership record
    await membershipToRemove.deleteOne();

    // Remove user from the Group's 'members' array (denormalization)
    group.members = group.members.filter(m => m.toString() !== userId.toString());
    await group.save();

    res.status(200).json({
        success: true,
        message: `Member ${userId} removed from group ${group.name}.`,
    });
});

// @desc    Get groups for a specific user
// @route   GET /api/users/:userId/groups
// @access  Private (authorizeOwnerOrAdmin for userId, or Admin/Officer)
exports.getUserGroups = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorResponse('Invalid User ID format.', 400));
    }

    // Find all active memberships for the user
    const memberships = await UserGroupMembership.find({
        user: userId,
        status: 'active'
    })
    .populate({
        path: 'group',
        populate: {
            path: 'leader', // Populate leader within the group
            select: 'name email'
        },
        select: 'name location meetingFrequency createdBy members account status formationDate' // Select relevant group fields
    })
    .populate('groupRole', 'name description permissions'); // Populate the group-specific role

    // Extract group details from memberships
    const groups = memberships.map(membership => {
        if (!membership.group) return null; // Handle cases where group might have been deleted but membership remains
        const groupObj = membership.group.toObject();
        groupObj.userRoleInGroup = membership.groupRole ? membership.groupRole.name : 'N/A';
        groupObj.userGroupPermissions = membership.groupRole ? membership.groupRole.permissions : [];
        return groupObj;
    }).filter(g => g !== null);


    res.status(200).json({
        success: true,
        count: groups.length,
        data: groups,
    });
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
        status: 'active'
    })
    .populate('user', 'name email phone nationalID role status') // Populate user details
    .populate('groupRole', 'name description permissions'); // Populate the custom group role

    const membersWithRoles = memberships.map(membership => {
        if (!membership.user) return null; // Handle cases where user might have been deleted
        const memberObj = membership.user.toObject();
        memberObj.groupMembershipId = membership._id; // Provide the membership ID
        memberObj.groupRole = membership.groupRole ? membership.groupRole.name : 'N/A';
        memberObj.groupPermissions = membership.groupRole ? membership.groupRole.permissions : [];
        memberObj.membershipStatus = membership.status;
        return memberObj;
    }).filter(m => m !== null);

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

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return next(new ErrorResponse('Invalid Group ID or User ID format.', 400));
    }
    if (!newRoleName || typeof newRoleName !== 'string' || newRoleName.trim() === '') {
        return next(new ErrorResponse('New role name is required.', 400));
    }

    const membership = await UserGroupMembership.findOne({
        user: userId,
        group: groupId,
        status: 'active'
    });

    if (!membership) {
        return next(new ErrorResponse('User is not an active member of this group.', 404));
    }

    // Find the target CustomGroupRole by name for this group
    const newCustomRole = await CustomGroupRole.findOne({
        group: groupId,
        name: newRoleName.trim(),
        isActive: true,
    });

    if (!newCustomRole) {
        return next(new ErrorResponse(`Role '${newRoleName}' not found or is inactive for this group.`, 404));
    }

    // If changing the group's current leader's role, ensure leadership is transferred first
    const group = await Group.findById(groupId).select('leader');
    if (group && group.leader.toString() === userId.toString() && newRoleName.trim() !== 'Leader') {
        return next(new ErrorResponse('Cannot change the current group leader\'s role directly. Please transfer leadership first.', 400));
    }

    membership.groupRole = newCustomRole._id;
    await membership.save();

    await membership.populate('user', 'name');
    await membership.populate('groupRole', 'name');

    res.status(200).json({
        success: true,
        message: `User ${membership.user.name} role updated to ${membership.groupRole.name} in group.`,
        data: membership,
    });
});