// server\middleware\auth.js
const { jwt, blacklist, ErrorResponse } = require('../utils');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');
const Group = require('../models/Group');
const CustomGroupRole = require('../models/CustomGroupRole');
const UserGroupMembership = require('../models/UserGroupMembership');
const Account = require('../models/Account'); // NEW: Import Account model
const Loan = require('../models/Loan'); // Added Loan model import
const Transaction = require('../models/Transaction'); // Added Transaction model import
const Meeting = require('../models/Meeting');
const mongoose = require('mongoose');

// Helper function to log only in development
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUTH_MIDDLEWARE]', ...args);
  }
};

// --- Core Authentication Middleware ---

// @desc    Protect routes - verify token and attach user to request
// @access  Public (internally restricts access if no token or invalid)
exports.protect = asyncHandler(async (req, res, next) => {
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
  if (blacklist.isBlacklisted(token)) {
    devLog('Token blacklisted:', token);
    return res.status(401).json({
      success: false,
      message: 'This token has been revoked. Please log in again.',
    });
  }

  // Verify token using utils (should throw an error for invalid/expired tokens)
  const decoded = jwt.verifyToken(token);
  devLog('Token decoded payload:', decoded);

  const user = await User.findById(decoded.id).select('-password');
  devLog('User found:', user ? 'yes, ID:' + user._id : 'no');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found. Authentication failed.',
    });
  }

  // Attach user and their global role to the request object
  req.user = user;
  req.userRole = user.role; // Convenient for quick global role checks

  devLog('User attached to req:', req.user._id, 'Role:', req.userRole);
  next();
});

// @desc    Optional authentication: attaches user if token is present and valid, but does not fail if missing/invalid
// @access  Public (allows unauthenticated access)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Check if the token is blacklisted (even for optional auth, revoked tokens should be rejected)
      if (blacklist.isBlacklisted(token)) {
        devLog(
          'Optional auth: Token blacklisted (ignored for attachment, but still logged).'
        );
        // Don't attach user, but don't error out the request
        return next();
      }

      const decoded = jwt.verifyToken(token);
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
});

// --- Role-Based Access Control (RBAC) ---

/**
 * @desc    Get default system permissions based on global user role.
 * This provides a baseline set of permissions for each system role.
 * @param   {string} role - The user's global system role (e.g., 'admin', 'officer', 'member').
 * @returns {string[]} An array of permission strings.
 */
const getDefaultPermissions = role => {
  const permissions = {
    admin: [
      'can_approve_small_loans',
      'can_record_attendance',
      'can_manage_savings', // Covers generic deposits/withdrawals
      'can_view_reports',
      'can_manage_members', // Users in general
      'can_schedule_meetings',
      'can_edit_group_info',
      'can_manage_roles', // For CustomGroupRole management
      'can_manage_users', // General user CRUD
      'can_manage_app_settings', // For managing the Settings model
      'can_manage_all_data', // Broad access for system-wide operations
      'can_create_system_transactions', // For generic/adjustment transactions
      'can_manage_contributions', // Broad for all contribution types
      'can_manage_loans', // Broad for all loan types
      'can_manage_expenses', // If you add expense tracking
      'can_approve_guarantors',
      'can_manage_guarantors',
    ],
    officer: [
      'can_approve_small_loans',
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members', // Users/members within groups they manage
      'can_schedule_meetings',
      'can_edit_group_info',
      'can_manage_contributions',
      'can_manage_loans',
      'can_approve_guarantors',
      'can_manage_guarantors',
    ],
    leader: [
      'can_record_attendance',
      'can_manage_savings',
      'can_view_reports',
      'can_manage_members',
      'can_schedule_meetings',
      'can_edit_group_info',
      'can_manage_contributions',
      'can_view_own_transactions',
      'can_request_loan',
      'can_contribute_savings',
      'can_approve_guarantors',
      'can_manage_guarantors',
    ],
    member: [
      'can_view_own_transactions',
      'can_request_loan',
      'can_contribute_savings',
      'can_view_meetings',
      'can_view_group_info',
      'can_view_reports',
      'can_guarantee_loan',
    ],
  };

  return permissions[role] || [];
};

// @desc    Role-based access control middleware (for global system roles)
//          Checks if the user's global role is included in the allowed roles.
// @param   {...string} roles - A list of allowed global roles (e.g., 'admin', 'officer').
// @access  Protected (requires `protect` middleware to run first)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      devLog(
        'Authorize middleware error: req.user or role not found. Ensure protect middleware runs first.'
      );
      return res.status(401).json({
        success: false,
        message:
          'Authentication context missing for authorization check. Please log in.',
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
    devLog(`Access granted for global role '${req.user.role}'.`);
    next();
  };
};

// @desc    Group-level permission authorization middleware.
//          Checks if the authenticated user has specific permissions within a given group context.
//          Admins/Officers bypass this check. Others need active group membership and required permissions.
// @param   {string|string[]} requiredPermissions - A single permission string or an array of permissions (e.g., 'can_manage_savings').
// @param   {string} [groupIdParam='groupId'] - The name of the request parameter or body field containing the group ID.
// @access  Protected (requires `protect` middleware to run first)
exports.authorizeGroupPermission = (
  requiredPermissions,
  groupIdParam = 'groupId'
) => {
  // Ensure requiredPermissions is an array for consistent checking
  const permsArray = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      devLog(
        'authorizeGroupPermission error: req.user not found. Ensure protect middleware runs first.'
      );
      return res.status(401).json({
        success: false,
        message:
          'Authentication context missing for group permission check. Please log in.',
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return next(new ErrorResponse('Invalid Group ID format.', 400));
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

    // If the user has a custom group role with defined permissions, use them
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
      // Fall back to default permissions based on system role if no custom role permissions
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
  });
};

// @desc    Check if user can access specific group data (e.g., is a member or creator).
//          This is a lighter check than authorizeGroupPermission, just for general membership/creation access.
// @param   {string} [groupIdParam='groupId'] - Request parameter containing group ID.
// @access  Protected (requires `protect` middleware to run first)
exports.authorizeGroupAccess = (groupIdParam = 'groupId') => {
  return asyncHandler(async (req, res, next) => {
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
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Group ID format.' });
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
        message: 'Access denied. You are not authorized to access this group.',
      });
    }

    devLog(`Access granted for user ${req.user._id} to group ${groupId}.`);
    next();
  });
};

// @desc    Check if user can access a specific resource based on its owner or if they are an admin/officer/group leader
// @param   {string} modelName - The name of the Mongoose model (e.g., 'Account', 'Loan')
// @param   {string} ownerField - The field on the model that represents its owner (e.g., 'owner')
// @access  Protected (requires `protect` middleware to run first)
exports.authorizeOwnerOrAdmin = (modelName, ownerField) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      // This check should ideally be handled by the 'protect' middleware already
      return next(
        new ErrorResponse(
          'Authentication required to access this resource.',
          401
        )
      );
    }

    // 1. Fetch the resource (e.g., Account, Loan, etc.)
    const resource = await mongoose.model(modelName).findById(req.params.id);

    if (!resource) {
      return next(new ErrorResponse(`${modelName} not found.`, 404));
    }

    // 2. Allow access for 'admin' or 'officer' roles regardless of ownership
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      // devLog(`Access granted for Admin/Officer (${req.user._id}) to ${modelName} ${req.params.id}.`); // Optional logging
      return next();
    }

    // 3. Allow access if the authenticated user is the direct owner of the resource
    //    (relevant for User-owned resources like a User's personal account)
    if (
      resource.ownerModel === 'User' &&
      resource[ownerField] &&
      resource[ownerField].toString() === req.user.id
    ) {
      // devLog(`Access granted for User-Owner (${req.user._id}) to their ${modelName} ${req.params.id}.`); // Optional logging
      return next();
    }

    // 4. Allow access if the resource is owned by a Group AND the authenticated user is a 'leader'
    //    within that specific owning Group.
    if (resource.ownerModel === 'Group' && resource[ownerField]) {
      const userMembership = await UserGroupMembership.findOne({
        user: req.user.id,
        group: resource[ownerField], // The ID of the group that owns the resource
        role: 'leader', // Assuming 'leader' role grants this permission within the group
        // If you use CustomGroupRole with granular permissions, you'd check something like:
        // 'customRole.permissions': 'can_manage_accounts' (requires populating customRole)
      });

      if (userMembership) {
        // devLog(`Access granted for Group Leader (${req.user._id}) to Group-owned ${modelName} ${req.params.id}.`); // Optional logging
        return next();
      }
    }

    // If none of the above conditions are met, deny access
    // devLog(`Access denied for user ${req.user._id} to ${modelName} ${req.params.id}. Not authorized.`); // Optional logging
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to perform this action on ${modelName}.`,
        403
      )
    );
  });

// @desc    Helper middleware to check if user can access a specific loan
// @param   {string} [loanIdParam='loanId'] - The name of the request parameter holding the loan ID.
// @access  Protected (requires `protect` middleware to run first)
exports.authorizeLoanAccess = (loanIdParam = 'loanId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required.' });
    }

    const loanId = req.params[loanIdParam];
    if (!loanId || !mongoose.Types.ObjectId.isValid(loanId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or missing Loan ID.' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: 'Loan not found.' });
    }

    // Store loan on request for subsequent middleware/controller
    req.targetLoan = loan;

    // Admins and Officers bypass specific loan access checks
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      devLog(
        `Access granted for system role (${req.user.role}) to loan ${loanId}.`
      );
      return next();
    }

    // Check if the current user is the borrower of the loan
    if (loan.borrower.toString() === req.user._id.toString()) {
      devLog(
        `Access granted for loan borrower (${req.user._id}) to loan ${loanId}.`
      );
      return next();
    }

    // Check if the current user is a guarantor on the loan
    const isGuarantor = loan.guarantors.some(
      guarantor => guarantor.guarantor.toString() === req.user._id.toString()
    );
    if (isGuarantor) {
      devLog(
        `Access granted for loan guarantor (${req.user._id}) to loan ${loanId}.`
      );
      return next();
    }

    // Check if the current user is an active member of the group that is the borrower
    if (loan.borrowerModel === 'Group') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: loan.borrower,
        status: 'active',
      });

      if (membership) {
        devLog(
          `Access granted for group member (${req.user._id}) to group loan ${loanId}.`
        );
        return next();
      }
    }

    devLog(
      `Access denied for user ${req.user._id} to loan ${loanId}. Not borrower, guarantor, admin, officer, or active group member.`
    );
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not authorized to access this loan.',
    });
  });
};

// @desc    Helper middleware to fetch an Account and then apply owner/group authorization
// @param   {string} [idParam='id'] - The name of the request parameter holding the account ID.
// @access  Protected (requires `protect` middleware to run first)
// IMPORTANT: This middleware should populate req.targetAccount for subsequent use.
exports.authorizeAccountAccess = (idParam = 'id') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required.' });
    }

    const accountId = req.params[idParam];
    if (!accountId || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or missing Account ID.' });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: 'Account not found.' });
    }

    // Store account on request for subsequent middleware/controller
    req.targetAccount = account;

    // Admins and Officers bypass specific account access checks
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      devLog(
        `Access granted for system role (${req.user.role}) to account ${accountId}.`
      );
      return next();
    }

    // Check if the current user is the owner of the account (if it's a User account)
    if (
      account.ownerModel === 'User' &&
      account.owner.toString() === req.user._id.toString()
    ) {
      devLog(
        `Access granted for account owner (${req.user._id}) to personal account ${accountId}.`
      );
      return next();
    }

    // Check if the current user is an active member of the group that owns the account (if it's a Group account)
    if (account.ownerModel === 'Group') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: account.owner,
        status: 'active',
      });

      if (membership) {
        devLog(
          `Access granted for group member (${req.user._id}) to group-owned account ${accountId}.`
        );
        return next();
      }
    }

    devLog(
      `Access denied for user ${req.user._id} to account ${accountId}. Not owner, admin, officer, or active group member.`
    );
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not authorized to access this account.',
    });
  });
};

exports.authorizeMeetingAccess = (permissions = []) => {
  return asyncHandler(async (req, res, next) => {
    const { id: meetingId } = req.params; // Get meeting ID from params

    // Basic validation for meetingId
    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return next(new ErrorResponse('Invalid Meeting ID format.', 400));
    }

    // Find the meeting and populate its group to get group details for permission check
    const meeting = await Meeting.findById(meetingId).populate({
      path: 'group',
      populate: {
        path: 'members', // Assuming group members can have roles that define permissions
        select: 'role _id', // Select only what's needed for role/ID check
      },
    });

    if (!meeting) {
      return next(new ErrorResponse('Meeting not found.', 404));
    }
    if (!meeting.group) {
      return next(
        new ErrorResponse('Associated group for meeting not found.', 404)
      );
    }

    // 1. Admins and Officers have full access
    if (['admin', 'officer'].includes(req.user.role)) {
      return next();
    }

    // 2. Check if the user is a member/leader of THIS specific group
    const isMemberOfThisGroup = meeting.group.members.some(
      member => member._id.toString() === req.user.id.toString()
    );

    if (!isMemberOfThisGroup) {
      return next(
        new ErrorResponse("You are not a member of this meeting's group.", 403)
      );
    }

    // 3. Further granular permission check for leaders if 'leader' role exists and has specific permissions
    // This assumes you have a way to define what a 'leader' can do
    // within their group (e.g., via permissions array on the user or role model).
    // For simplicity here, if the user is a leader of this group AND the action requires a 'leader' role, allow it.
    // If your `req.user.role` can be 'leader', this condition handles it.
    if (permissions.length > 0 && req.user.role === 'leader') {
      // You can add more granular checks here if 'leader' role has specific permissions
      // e.g., if(req.user.permissions.includes('can_edit_meeting_info')) { return next(); }
      // For now, assuming if they are a leader of this group and action is for leaders, it's allowed.
      // This is where you'd link the `permissions` array passed to the middleware to the user's actual permissions.
      // For instance, if 'can_edit_meeting_info' is one of the `permissions` required for this route,
      // you'd check if the `req.user` (as a 'leader' of this group) possesses that permission.
      // As a fallback/simple approach: if they are a leader of this group and you're here, allow.
      return next();
    }

    // If none of the above conditions met, deny access
    return next(
      new ErrorResponse(
        'You are not authorized to perform this action on this meeting.',
        403
      )
    );
  });
};

// @desc    Filter data based on user role and group membership.
//          This middleware adds a 'dataFilter' object to the request which can be used
//          in Mongoose queries to restrict results.
//          This middleware should be used BEFORE the query is executed.
// @param   {string} modelName - The name of the model being filtered (e.g., 'Loan', 'User', 'Group', 'Transaction', 'Report').
// @access  Protected (requires `protect` middleware to run first)
exports.filterDataByRole = modelName => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      devLog(
        'filterDataByRole error: req.user not found. Ensure protect middleware runs first.'
      );
      return res.status(401).json({
        success: false,
        message: 'Authentication required for data filtering.',
      });
    }

    // Admins and Officers see all data (do not force a `deleted: false` filter on models
    // that don't have that field like `User` and `Group`).
    if (req.user.role === 'admin' || req.user.role === 'officer') {
      // For 'Report' type, admins/officers see everything across models
      if (modelName === 'Report') {
        req.dataFilter = {
          Loan: { deleted: false },
          Transaction: { deleted: false },
          User: {},
          Group: { status: { $ne: 'dissolved' } },
          Account: { deleted: false },
        };
      } else {
        // No global filter for admins/officers. Controllers can add their own if needed.
        req.dataFilter = {};
      }
      devLog(
        `Data filter: ${req.user.role} sees all data for model ${modelName}.`
      );
      return next();
    }

    // For other roles (leader, member), filter by their associated groups or personal data
    const userGroupMemberships = await UserGroupMembership.find({
      user: req.user._id,
      status: 'active',
    }).select('group role');

    const userGroups = userGroupMemberships.map(m => m.group);
    const userIsLeaderOfAnyGroup = userGroupMemberships.some(
      m => m.role === 'leader'
    );

    // Initialize a base filter for the current model. This will be an $or query.
    let filter = { $or: [], deleted: false };

    // For 'Report' modelName, we'll build a more complex object with filters for multiple models
    let reportFilters = {};

    switch (modelName) {
      case 'Loan':
        // User is borrower of the loan (individual)
        filter.$or.push({ borrower: req.user._id, borrowerModel: 'User' });
        // User is a guarantor on the loan
        filter.$or.push({ 'guarantors.guarantor': req.user._id });
        // Loan's borrower is one of the groups the user is associated with
        if (userGroups.length > 0) {
          filter.$or.push({
            borrower: { $in: userGroups },
            borrowerModel: 'Group',
          });
        }
        break;

      case 'Transaction':
        // Transaction related to the user's personal account
        filter.$or.push({ member: req.user._id });
        // Transaction related to a group the user is part of
        if (userGroups.length > 0) {
          filter.$or.push({ group: { $in: userGroups } });
        }
        // Transaction related to a loan the user has access to (as borrower or group borrower or guarantor)
        const accessibleLoansForTransactions = await Loan.find({
          $or: [
            { borrower: req.user._id, borrowerModel: 'User' },
            { 'guarantors.guarantor': req.user._id },
            ...(userGroups.length > 0
              ? [{ borrower: { $in: userGroups }, borrowerModel: 'Group' }]
              : []),
          ],
        })
          .select('_id')
          .lean();
        const accessibleLoanIdsForTransactions =
          accessibleLoansForTransactions.map(loan => loan._id);

        if (accessibleLoanIdsForTransactions.length > 0) {
          filter.$or.push(
            {
              relatedEntity: { $in: accessibleLoanIdsForTransactions },
              relatedEntityType: 'Loan',
            },
            { loan: { $in: accessibleLoanIdsForTransactions } }
          );
        }
        break;

      case 'User':
        // User can see themselves
        filter.$or.push({ _id: req.user._id });
        // Leaders can see members of their groups
        if (userIsLeaderOfAnyGroup) {
          const membersInAccessibleGroups = await UserGroupMembership.find({
            group: { $in: userGroups },
            status: 'active',
          }).distinct('user');
          if (membersInAccessibleGroups.length > 0) {
            filter.$or.push({ _id: { $in: membersInAccessibleGroups } });
          }
        }
        break;

      case 'Group':
        // User can see groups they are a member of
        if (userGroups.length > 0) {
          filter.$or.push({ _id: { $in: userGroups } });
        }
        break;

      case 'Account': // NEW: Add specific filtering for Account model
        // User can see accounts they own
        filter.$or.push({ owner: req.user._id, ownerModel: 'User' });
        // User can see accounts owned by groups they are members of
        if (userGroups.length > 0) {
          filter.$or.push({
            owner: { $in: userGroups },
            ownerModel: 'Group',
          });
        }
        break;

      case 'Notification':
        // User can see notifications addressed to them
        filter.$or.push({ recipientModel: 'User', recipient: req.user._id });
        // User can see notifications addressed to their groups
        if (userGroups.length > 0) {
          filter.$or.push({
            recipientModel: 'Group',
            recipient: { $in: userGroups },
          });
        }
        break;

      case 'Report':
        // This case builds filters for multiple models relevant to dashboard/reports
        // 1. User Filter for members included in reports
        const accessibleUserIds = [req.user._id];
        if (userIsLeaderOfAnyGroup) {
          const membersInAccessibleGroups = await UserGroupMembership.find({
            group: { $in: userGroups },
            status: 'active',
            role: { $in: ['member', 'leader'] }, // Leaders can see other leaders and members
          }).distinct('user');
          accessibleUserIds.push(...membersInAccessibleGroups);
        }
        reportFilters.User = {
          _id: { $in: [...new Set(accessibleUserIds)] },
          role: 'member',
          deleted: false,
        };

        // 2. Group Filter for groups included in reports
        reportFilters.Group = { _id: { $in: userGroups }, deleted: false };

        // 3. Loan Filter for loans included in reports
        const reportLoanQueryConditions = [
          { borrower: req.user._id, borrowerModel: 'User' },
          { 'guarantors.guarantor': req.user._id },
        ];
        if (userGroups.length > 0) {
          reportLoanQueryConditions.push({
            borrower: { $in: userGroups },
            borrowerModel: 'Group',
          });
        }
        reportFilters.Loan = {
          $or: reportLoanQueryConditions,
          deleted: false,
        };

        // 4. Transaction Filter for transactions included in reports
        const reportTransactionQueryConditions = [{ member: req.user._id }];
        if (userGroups.length > 0) {
          reportTransactionQueryConditions.push({
            group: { $in: userGroups },
          });
        }
        const reportAccessibleLoans = await Loan.find(reportFilters.Loan)
          .select('_id')
          .lean();
        const reportAccessibleLoanIds = reportAccessibleLoans.map(
          loan => loan._id
        );

        if (reportAccessibleLoanIds.length > 0) {
          reportTransactionQueryConditions.push(
            {
              relatedEntity: { $in: reportAccessibleLoanIds },
              relatedEntityType: 'Loan',
            },
            { loan: { $in: reportAccessibleLoanIds } }
          );
        }
        reportFilters.Transaction = {
          $or: reportTransactionQueryConditions,
          deleted: false,
        };

        // 5. Account Filter for accounts included in reports (specifically savings accounts for members/groups)
        const reportAccountQueryConditions = [
          { owner: req.user._id, ownerModel: 'User' },
        ];
        if (userGroups.length > 0) {
          reportAccountQueryConditions.push({
            owner: { $in: userGroups },
            ownerModel: 'Group',
          });
        }
        reportFilters.Account = {
          $or: reportAccountQueryConditions,
          deleted: false,
          type: 'savings',
        }; // Filter for savings type explicitly for reports

        req.dataFilter = reportFilters; // Set the multi-model filter object
        devLog('Data filter for Report type:', JSON.stringify(req.dataFilter));
        return next(); // Return here as req.dataFilter is already set as an object
      case 'Meeting':
        if (userGroups.length > 0) {
          filter.$or.push({ group: { $in: userGroups } });
        } else {
          filter.$or.push({ _id: null }); // Match nothing
        }
        break;
      case 'Guarantor':
        // User is the guarantor
        filter.$or.push({ guarantor: req.user._id });

        // Guarantor is tied to a loan, so check if the user has access to the loan
        const accessibleLoansAsBorrowerOrGuarantor = await Loan.find({
          $or: [
            { borrower: req.user._id, borrowerModel: 'User' },
            { 'guarantors.guarantor': req.user._id },
            ...(userGroups.length > 0
              ? [{ borrower: { $in: userGroups }, borrowerModel: 'Group' }]
              : []),
          ],
        })
          .select('_id')
          .lean();
        const accessibleLoanIdsForGuarantor =
          accessibleLoansAsBorrowerOrGuarantor.map(loan => loan._id);

        if (accessibleLoanIdsForGuarantor.length > 0) {
          filter.$or.push({ loan: { $in: accessibleLoanIdsForGuarantor } });
        }
        break;

      default:
        // For models not explicitly handled, apply a general filter based on user's groups or their own ID
        // This covers models with 'group' or 'user' fields
        if (userGroups.length > 0) {
          filter.$or.push({ group: { $in: userGroups } });
        }
        filter.$or.push({ user: req.user._id });
        filter.$or.push({ createdBy: req.user._id });
        break;
    }

    if (filter.$or.length === 0) {
      req.dataFilter = { _id: null };
      devLog(
        `Data filter: No specific access for model ${modelName}, setting filter to return no documents.`
      );
    } else {
      req.dataFilter = filter;
      devLog(
        `Data filter for model ${modelName} applied:`,
        JSON.stringify(req.dataFilter)
      );
    }

    next();
  });
};
