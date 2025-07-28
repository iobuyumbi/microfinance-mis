const User = require('../models/User');
const Group = require('../models/Group');
const Savings = require('../models/Savings');
const Transaction = require('../models/Transaction');

// Get all users - filtered based on user role and permissions
exports.getAllUsers = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required' });
    }

    let users;

    // Admin and Officers can see all users
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      users = await User.find()
        .select('-password')
        .populate('groupRoles.groupId', 'name');
    } else {
      // Leaders and Members can only see users in their groups
      const userGroups = await Group.find({ members: req.user._id });
      const groupIds = userGroups.map(group => group._id);

      users = await User.find({
        'groupRoles.groupId': { $in: groupIds },
      })
        .select('-password')
        .populate('groupRoles.groupId', 'name');
    }

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    // Only allow admin, officer, or the user themselves
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'officer' &&
      req.user.id !== user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    // Prevent role/status change via this endpoint
    delete updates.role;
    delete updates.status;
    delete updates.password; // Password change should be separate

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: '-password',
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRoleStatus = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// Get user's groups
exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user is requesting their own groups or has permission
    if (
      req.params.userId &&
      req.user.role !== 'admin' &&
      req.user.role !== 'officer' &&
      req.user.id !== req.params.userId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

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
  } catch (error) {
    next(error);
  }
};

// Get group members with proper access control
exports.getGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Check access permissions
    const isMember = group.members.includes(req.user._id);
    const isGroupLeader =
      group.createdBy.toString() === req.user._id.toString();
    const hasGlobalAccess =
      req.user.role === 'admin' || req.user.role === 'officer';

    // Only allow access if user is a member, leader, admin, or officer
    if (!isMember && !isGroupLeader && !hasGlobalAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get group members with their group-specific roles
    const members = await User.find({
      'groupRoles.groupId': groupId,
    }).select('name email role status groupRoles');

    // Filter group roles to only show the relevant group
    const filteredMembers = members.map(member => {
      const groupRole = member.groupRoles.find(
        gr => gr.groupId.toString() === groupId
      );
      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        groupRole: groupRole ? groupRole.role : 'member',
        groupStatus: groupRole ? groupRole.status : 'active',
      };
    });

    res.status(200).json({ success: true, data: filteredMembers });
  } catch (error) {
    next(error);
  }
};

// Update group member role with proper access control
exports.updateGroupMemberRole = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const { role, permissions } = req.body;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Check access permissions for role updates
    const isGroupLeader =
      group.createdBy.toString() === req.user._id.toString();
    const hasGlobalAccess =
      req.user.role === 'admin' || req.user.role === 'officer';

    // Only group leaders, admins, and officers can update roles
    if (!isGroupLeader && !hasGlobalAccess) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            'Access denied - only group leaders, admins, and officers can update roles',
        });
    }

    // Group leaders can only update roles in their own groups
    if (isGroupLeader && !hasGlobalAccess) {
      // Additional check to ensure the group leader is only updating their own group
      if (group.createdBy.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({
            success: false,
            message: 'Access denied - can only update roles in your own groups',
          });
      }
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Member not found' });
    }

    // Update or add group role
    const existingRoleIndex = user.groupRoles.findIndex(
      gr => gr.groupId.toString() === groupId
    );

    if (existingRoleIndex >= 0) {
      user.groupRoles[existingRoleIndex].role = role;
      if (permissions) {
        user.groupRoles[existingRoleIndex].permissions = permissions;
      }
    } else {
      user.groupRoles.push({
        groupId,
        role,
        permissions: permissions || [],
        status: 'active',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update group member status
exports.updateGroupMemberStatus = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const { status } = req.body;

    // Check if user has permission to update status
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Only group leader, admin, or officer can update status
    const isGroupLeader = group.createdBy.toString() === req.user.id;
    const hasGlobalAccess =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isGroupLeader && !hasGlobalAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Member not found' });
    }

    // Update group role status
    const groupRoleIndex = user.groupRoles.findIndex(
      gr => gr.groupId.toString() === groupId
    );

    if (groupRoleIndex >= 0) {
      user.groupRoles[groupRoleIndex].status = status;
    } else {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Member status updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Add member to group
exports.addMemberToGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;

    // Check if user has permission to add members
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Only group leader, admin, or officer can add members
    const isGroupLeader = group.createdBy.toString() === req.user.id;
    const hasGlobalAccess =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isGroupLeader && !hasGlobalAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Check if user is already a member
    if (group.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group',
      });
    }

    // Add user to group
    group.members.push(user._id);
    await group.save();

    // Add group role to user
    const existingRoleIndex = user.groupRoles.findIndex(
      gr => gr.groupId.toString() === groupId
    );
    if (existingRoleIndex === -1) {
      user.groupRoles.push({
        groupId,
        role: 'member',
        permissions: [],
        status: 'active',
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: { group, user },
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from group
exports.removeMemberFromGroup = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;

    // Check if user has permission to remove members
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Only group leader, admin, or officer can remove members
    const isGroupLeader = group.createdBy.toString() === req.user.id;
    const hasGlobalAccess =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isGroupLeader && !hasGlobalAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Remove user from group
    group.members = group.members.filter(id => id.toString() !== memberId);
    await group.save();

    // Remove group role from user
    const user = await User.findById(memberId);
    if (user) {
      user.groupRoles = user.groupRoles.filter(
        gr => gr.groupId.toString() !== groupId
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get user's financial summary
exports.getUserFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Check if user is requesting their own data or has permission
    if (
      req.params.userId &&
      req.user.role !== 'admin' &&
      req.user.role !== 'officer' &&
      req.user.id !== req.params.userId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get user's groups
    const groups = await Group.find({
      $or: [{ members: userId }, { createdBy: userId }],
    });

    // Get user's savings
    const savings = await Savings.find({ member: userId });
    const totalSavings = savings.reduce(
      (sum, saving) => sum + saving.amount,
      0
    );

    // Get user's transactions
    const transactions = await Transaction.find({ member: userId });

    // Calculate group totals
    const groupSummaries = await Promise.all(
      groups.map(async group => {
        const groupSavings = await Savings.find({ group: group._id });
        const groupTransactions = await Transaction.find({ group: group._id });

        return {
          groupId: group._id,
          groupName: group.name,
          totalSavings: groupSavings.reduce(
            (sum, saving) => sum + saving.amount,
            0
          ),
          totalTransactions: groupTransactions.length,
          memberCount: group.members.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        userId,
        totalSavings,
        totalTransactions: transactions.length,
        groups: groupSummaries,
        savingsHistory: savings.slice(-10), // Last 10 savings records
        transactionHistory: transactions.slice(-10), // Last 10 transactions
      },
    });
  } catch (error) {
    next(error);
  }
};
