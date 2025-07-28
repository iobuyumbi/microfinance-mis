// Enhanced Role-Based Access Control (RBAC) Middleware
const User = require('../models/User');
const Group = require('../models/Group');
const CustomGroupRole = require('../models/CustomGroupRole');

/**
 * System-level role authorization
 * @param {...string} roles - Required system roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Group-level permission authorization
 * @param {string} permission - Required group permission
 * @param {string} groupIdParam - Request parameter containing group ID (default: 'groupId')
 */
const authorizeGroupPermission = (permission, groupIdParam = 'groupId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin and officers have all permissions
      if (req.user.role === 'admin' || req.user.role === 'officer') {
        return next();
      }

      const groupId = req.params[groupIdParam] || req.body.groupId;
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'Group ID is required',
        });
      }

      // Check if user is a member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isMember = group.members.includes(req.user._id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this group',
        });
      }

      // Check group-specific role permissions
      const userGroupRole = req.user.groupRoles.find(
        role => role.groupId.toString() === groupId.toString()
      );

      if (userGroupRole && userGroupRole.customRole) {
        const customRole = await CustomGroupRole.findById(userGroupRole.customRole);
        if (customRole && customRole.permissions.includes(permission)) {
          return next();
        }
      }

      // Check default permissions based on system role
      const defaultPermissions = getDefaultPermissions(req.user.role);
      if (defaultPermissions.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Access denied. Required permission: ${permission}`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message,
      });
    }
  };
};

/**
 * Check if user can access specific group data
 * @param {string} groupIdParam - Request parameter containing group ID
 */
const authorizeGroupAccess = (groupIdParam = 'groupId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin and officers can access all groups
      if (req.user.role === 'admin' || req.user.role === 'officer') {
        return next();
      }

      const groupId = req.params[groupIdParam] || req.body.groupId;
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'Group ID is required',
        });
      }

      // Check if user is a member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isMember = group.members.includes(req.user._id);
      const isCreator = group.createdBy.toString() === req.user._id.toString();

      if (!isMember && !isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this group',
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking group access',
        error: error.message,
      });
    }
  };
};

/**
 * Check if user can access their own data or if admin/officer
 */
const authorizeOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userId = req.params[userIdParam] || req.body.userId;
    const isOwner = userId === req.user._id.toString();
    const isAdminOrOfficer = req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !isAdminOrOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own data',
      });
    }

    next();
  };
};

/**
 * Filter data based on user role and group membership
 */
const filterDataByRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Admin and officers see all data
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      req.dataFilter = {}; // No filter - see all
      return next();
    }

    // Leaders and members see only their group data
    const userGroups = await Group.find({
      $or: [
        { members: req.user._id },
        { createdBy: req.user._id }
      ]
    }).select('_id');

    const groupIds = userGroups.map(group => group._id);

    req.dataFilter = {
      $or: [
        { group: { $in: groupIds } },
        { groupId: { $in: groupIds } },
        { user: req.user._id },
        { userId: req.user._id },
        { createdBy: req.user._id }
      ]
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error filtering data',
      error: error.message,
    });
  }
};

/**
 * Get default permissions based on system role
 */
const getDefaultPermissions = (role) => {
  const permissions = {
    admin: [
      'can_approve_small_loans',
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members',
      'can_schedule_meetings',
      'can_edit_group_info',
      'can_manage_roles',
    ],
    officer: [
      'can_approve_small_loans',
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members',
      'can_schedule_meetings',
      'can_edit_group_info',
    ],
    leader: [
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members',
      'can_schedule_meetings',
      'can_edit_group_info',
    ],
    member: [
      'can_view_reports',
    ],
  };

  return permissions[role] || [];
};

module.exports = {
  authorizeRoles,
  authorizeGroupPermission,
  authorizeGroupAccess,
  authorizeOwnerOrAdmin,
  filterDataByRole,
  getDefaultPermissions,
};
