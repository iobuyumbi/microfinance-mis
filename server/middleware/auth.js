// server\middleware\auth.js
const { verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../utils/blacklist');
const User = require('../models/User');
const Group = require('../models/Group'); // Needed for group membership checks
const CustomGroupRole = require('../models/CustomGroupRole'); // Needed for custom group role permissions
const UserGroupMembership = require('../models/UserGroupMembership'); // Essential for group relationships

// Helper function to log only in development
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH_MIDDLEWARE]', ...args);
  }
};

// Protect routes - verify token and attach user to request
exports.protect = async (req, res, next) => {
  try {
    devLog(
      'Auth middleware - headers:',
      req.headers.authorization
        ? 'Bearer token present'
        : 'No Authorization header'
    );

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    devLog('Token extracted:', token ? 'present' : 'missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Check if the token is blacklisted
    if (isBlacklisted(token)) {
      devLog('Token blacklisted:', token);
      return res.status(401).json({
        success: false,
        message: 'This token has been revoked. Please log in again.',
      });
    }

    // Verify token using utils
    const decoded = verifyToken(token); // This should throw an error for invalid/expired tokens
    devLog('Token decoded payload:', decoded);

    const user = await User.findById(decoded.id).select('-password');
    devLog('User found:', user ? 'yes, ID:' + user._id : 'no');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authentication failed.',
      });
    }
    // Also attach user's global role
    req.user = user;
    req.userRole = user.role; // Convenient to have global role readily available

    devLog('User attached to req:', req.user._id, 'Role:', req.userRole);
    next();
  } catch (error) {
    devLog('Auth middleware error:', error.message);
    // Generic error message for security reasons
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Role-based access control middleware (for global system roles)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user and req.user.role exist from the protect middleware
    if (!req.user || !req.user.role) {
      devLog(
        'Authorize middleware error: req.user or role not found. Ensure protect middleware runs first.'
      );
      return res.status(500).json({
        // Should ideally not happen if protect runs first
        success: false,
        message: 'Authentication context missing for authorization check.',
      });
    }

    if (!roles.includes(req.user.role)) {
      devLog(
        `Access denied for role '${req.user.role}'. Required roles: [${roles.join(', ')}]`
      );
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${roles.join(', ')}]`,
      });
    }
    devLog(`Access granted for role '${req.user.role}'.`);
    next();
  };
};

// Optional authentication: attaches user if token is present and valid, but does not fail if missing/invalid
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (user) {
        req.user = user;
        req.userRole = user.role;
        devLog('Optional auth: User attached from valid token.');
      } else {
        devLog('Optional auth: User not found for token payload.');
      }
    } catch (error) {
      devLog(
        'Optional auth error: Invalid or expired token (ignored for optional auth).',
        error.message
      );
      // No action needed for invalid/expired token in optionalAuth; just don't attach user
    }
  } else {
    devLog('Optional auth: No token provided.');
  }
  // Always call next(), regardless of whether a user was attached
  next();
};

/**
 * Get default permissions based on system role (moved from rbac.js)
 */
const getDefaultPermissions = role => {
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
      'can_manage_users', // Add general user management
      'can_manage_app_settings', // For managing the Settings model
      'can_manage_all_data', // Broad permission for admin
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
      // Group leader role
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members',
      'can_schedule_meetings',
      'can_edit_group_info',
      // Potentially more granular for leader within their group
    ],
    member: [
      // Basic member role
      'can_view_reports',
      'can_view_own_transactions', // Added for clarity
      'can_request_loan', // Members can request loans
      'can_contribute_savings', // Members can contribute savings
      'can_view_meetings', // Can view group meetings
      // Specific read-only permissions
    ],
    // Add other roles like 'guest' or 'pending' if applicable
  };

  return permissions[role] || [];
};

/**
 * Group-level permission authorization
 * This middleware assumes that req.user is already attached by `protect`
 * and that `groupId` is available in `req.params` or `req.body`
 *
 * @param {string|string[]} requiredPermissions - A single permission string or an array of permissions
 * @param {string} groupIdParam - The name of the request parameter or body field containing the group ID (default: 'groupId')
 */
exports.authorizeGroupPermission = (
  requiredPermissions,
  groupIdParam = 'groupId'
) => {
  // Ensure requiredPermissions is an array for consistent checking
  const permsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        devLog(
          'authorizeGroupPermission error: req.user not found. Ensure protect middleware runs first.'
        );
        return res.status(500).json({
          success: false,
          message: 'Authentication context missing for group permission check.',
        });
      }

      const groupId = req.params[groupIdParam] || req.body.groupId;
      if (!groupId) {
        devLog('authorizeGroupPermission error: groupId not found in request.');
        return res.status(400).json({
          success: false,
          message: 'Group ID is required for this action.',
        });
      }

      // 1. Admins and Officers have full access regardless of group roles
      if (req.user.role === 'admin' || req.user.role === 'officer') {
        devLog(
          `Access granted for system role (${req.user.role}) on group ${groupId}.`
        );
        return next();
      }

      // 2. Find the user's active membership for this specific group
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: groupId,
        status: 'active', // Only consider active memberships
      }).populate({
        path: 'groupRole', // Populate the CustomGroupRole linked to the membership
        select: 'permissions name', // Select only necessary fields
      });

      if (!membership) {
        // User is not an active member of this group
        devLog(
          `Access denied: User ${req.user._id} is not an active member of group ${groupId}.`
        );
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not an active member of this group.',
        });
      }

      let userPermissions = [];

      // If the user has a custom group role, get permissions from it
      if (
        membership.groupRole &&
        membership.groupRole.permissions &&
        membership.groupRole.permissions.length > 0
      ) {
        userPermissions = membership.groupRole.permissions;
        devLog(
          `User ${req.user._id} has custom group role '${membership.groupRole.name}' with permissions:`,
          userPermissions
        );
      } else {
        // If no custom role or no permissions defined in custom role, fall back to default permissions based on system role
        userPermissions = getDefaultPermissions(req.user.role);
        devLog(
          `User ${req.user._id} has no custom group role or empty permissions; using default permissions for global role '${req.user.role}':`,
          userPermissions
        );
      }

      // Check if the user has ALL of the required permissions for this action
      const hasAllPermissions = permsArray.every(perm =>
        userPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        devLog(
          `Access denied for user ${req.user._id}. Missing required group permissions for group ${groupId}. Required: [${permsArray.join(', ')}], User has: [${userPermissions.join(', ')}]`
        );
        return res.status(403).json({
          success: false,
          message: `Access denied. You need the following group permissions: [${permsArray.join(', ')}]`,
        });
      }

      devLog(
        `Access granted for user ${req.user._id} with group role '${membership.groupRole?.name || req.user.role}'. All required permissions met.`
      );
      next();
    } catch (error) {
      devLog('authorizeGroupPermission internal error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error during group permission check.',
      });
    }
  };
};

/**
 * Check if user can access specific group data (e.g., is a member or creator)
 * This is a lighter check than authorizeGroupPermission, just for general access.
 * @param {string} groupIdParam - Request parameter containing group ID (default: 'groupId')
 */
exports.authorizeGroupAccess = (groupIdParam = 'groupId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        devLog(
          'authorizeGroupAccess error: req.user not found. Ensure protect middleware runs first.'
        );
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Admin and officers can access all groups
      if (req.user.role === 'admin' || req.user.role === 'officer') {
        devLog(
          `Access granted for system role (${req.user.role}) to group access.`
        );
        return next();
      }

      const groupId = req.params[groupIdParam] || req.body.groupId;
      if (!groupId) {
        devLog('authorizeGroupAccess error: groupId not found in request.');
        return res.status(400).json({
          success: false,
          message: 'Group ID is required for this action.',
        });
      }

      // Check if user has an active UserGroupMembership for this group
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: groupId,
        status: 'active',
      });

      // Also check if the user is the creator of the group
      const group = await Group.findById(groupId).select('createdBy');
      const isCreator =
        group &&
        group.createdBy &&
        group.createdBy.toString() === req.user._id.toString();

      if (!membership && !isCreator) {
        devLog(
          `Access denied: User ${req.user._id} is neither an active member nor creator of group ${groupId}.`
        );
        return res.status(403).json({
          success: false,
          message:
            'Access denied. You are not authorized to access this group.',
        });
      }

      devLog(`Access granted for user ${req.user._id} to group ${groupId}.`);
      next();
    } catch (error) {
      devLog('authorizeGroupAccess internal error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error checking group access.',
      });
    }
  };
};

/**
 * Check if user can access their own data or if they are an admin/officer
 * Assumes the target user ID is in req.params or req.body
 * @param {string} userIdParam - Request parameter or body field containing the target user ID (default: 'userId')
 */
exports.authorizeOwnerOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      devLog(
        'authorizeOwnerOrAdmin error: req.user not found. Ensure protect middleware runs first.'
      );
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const targetUserId = req.params[userIdParam] || req.body.userId;

    const isOwner =
      targetUserId && targetUserId.toString() === req.user._id.toString();
    const isAdminOrOfficer =
      req.user.role === 'admin' || req.user.role === 'officer';

    if (!isOwner && !isAdminOrOfficer) {
      devLog(
        `Access denied for user ${req.user._id}. Not owner or admin/officer for target ${targetUserId}.`
      );
      return res.status(403).json({
        success: false,
        message:
          'Access denied. You can only access your own data unless you are an Admin or Officer.',
      });
    }
    devLog(
      `Access granted for user ${req.user._id} (owner or admin/officer) to target ${targetUserId}.`
    );
    next();
  };
};

/**
 * Filter data based on user role and group membership.
 * This middleware adds a 'dataFilter' object to the request which can be used
 * in Mongoose queries to restrict results.
 * This middleware should be used BEFORE the query is executed.
 */
exports.filterDataByRole = async (req, res, next) => {
  try {
    if (!req.user) {
      devLog(
        'filterDataByRole error: req.user not found. Ensure protect middleware runs first.'
      );
      return res.status(401).json({
        success: false,
        message: 'Authentication required for data filtering.',
      });
    }

    // Admin and officers see all data
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      req.dataFilter = {}; // No filter - see all
      devLog('Data filter: Admin/Officer sees all data.');
      return next();
    }

    // For other roles (leader, member), filter by their associated groups or personal data
    const userMemberships = await UserGroupMembership.find({
      user: req.user._id,
      status: 'active',
    }).select('group'); // Get group IDs from active memberships

    const groupIds = userMemberships.map(membership => membership.group);

    // Also include groups where the user is the creator (if not already covered by membership)
    const createdGroups = await Group.find({ createdBy: req.user._id }).select(
      '_id'
    );
    createdGroups.forEach(group => {
      if (!groupIds.some(id => id.equals(group._id))) {
        groupIds.push(group._id);
      }
    });

    // Construct the filter. Adapt this based on how your models link to users/groups.
    // Example: Transaction model might have 'user' or 'groupId' field
    req.dataFilter = {
      $or: [
        { group: { $in: groupIds } }, // For models with a 'group' field referencing Group ID
        { groupId: { $in: groupIds } }, // For models with a 'groupId' field referencing Group ID
        { user: req.user._id }, // For models with a 'user' field referencing User ID
        { userId: req.user._id }, // For models with a 'userId' field referencing User ID
        { createdBy: req.user._id }, // For models where user created the record
      ],
    };
    devLog(
      'Data filter: User has restricted view based on groups:',
      groupIds.map(id => id.toString()),
      ' and personal ID:',
      req.user._id
    );
    next();
  } catch (error) {
    devLog('filterDataByRole internal error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error preparing data filter.',
    });
  }
};
