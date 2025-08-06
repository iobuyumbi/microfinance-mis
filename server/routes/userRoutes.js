// server\routes\userRoutes.js (REVISED - LEADER ROLE ADDED TO CREATE USER)
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserRoleStatus,
  deleteUser,
  getUserGroups,
  getUserFinancialSummary,
  createUser, // Import the createUser controller function
} = require('../controllers/userController');

// Import group-related functions from groupMembershipController
const {
  getGroupMembers,
  updateMemberRoleInGroup,
  addMemberToGroup,
  removeMemberFromGroup,
} = require('../controllers/groupMembershipController');
const {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeGroupPermission,
  filterDataByRole,
  authorizeGroupAccess,
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// User routes - all protected
router.use(protect);

// --- NEW: Route for creating a new user by Admin/Officer/Leader ---
// @route   POST /api/users
// @desc    Create a new user (by admin/officer/leader)
// @access  Private (Admin, Officer, or Leader only)
router.post(
  '/', // Corresponds to /api/users
  authorize('admin', 'officer', 'leader'), // NOW allows admin, officer, and LEADER to create users
  validateRequiredFields(['name', 'email', 'password', 'role']), // Basic fields for new user
  createUser // Controller function to handle creation
);
// -------------------------------------------------------------

// Get all users - role-based filtering applied in controller
router.route('/').get(filterDataByRole('User'), getAllUsers);

// Profile management - users can update their own profile
router
  .route('/profile')
  .put(validateRequiredFields(['name']), updateUserProfile);

// User management by ID
router
  .route('/:id')
  .get(validateObjectId, authorizeOwnerOrAdmin('id'), getUserById)
  .put(
    authorize('admin', 'officer'), // Officer and Admin update other user roles/status
    validateObjectId,
    updateUserRoleStatus
  )
  .delete(authorize('admin'), validateObjectId, deleteUser);

// Get groups for a specific user - owner or admin only
router.get(
  '/:id/groups',
  validateObjectId,
  authorizeOwnerOrAdmin('id'),
  getUserGroups
);

// Get user's financial summary - owner or admin only
router.get(
  '/:id/financial-summary',
  validateObjectId,
  authorizeOwnerOrAdmin('id'),
  getUserFinancialSummary
);

// Group member management routes with proper RBAC
router.get(
  '/groups/:groupId/members',
  validateObjectId,
  authorizeGroupAccess('groupId'),
  getGroupMembers
);

router.put(
  '/groups/:groupId/members/:memberId/role',
  validateObjectId,
  authorizeGroupPermission('can_manage_members', 'groupId'),
  updateMemberRoleInGroup
);

router.post(
  '/groups/:groupId/members',
  validateObjectId,
  authorizeGroupPermission('can_manage_members', 'groupId'),
  addMemberToGroup
);

router.delete(
  '/groups/:groupId/members/:memberId',
  validateObjectId,
  authorizeGroupPermission('can_manage_members', 'groupId'),
  removeMemberFromGroup
);

module.exports = router;
