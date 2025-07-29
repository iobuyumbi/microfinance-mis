// server\routes\groupRoutes.js
const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  joinGroup, // Assuming this will be moved into groupController for better MVC
} = require('../controllers/groupController'); // Ensure joinGroup is exported from here
const {
  protect,
  authorize,
  authorizeGroupPermission,
  authorizeGroupAccess,
  filterDataByRole,
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Protect all routes in this router
router.use(protect);

// --- Test Endpoint (for debugging auth) ---
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Authentication test for group routes',
  });
});

// --- Group CRUD Operations ---

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Admin, Officer, or Member with 'can_create_group' permission - if you have one)
//          For now, let's allow Officer to create groups. Admins implicitly can.
router.post(
  '/',
  authorize('admin', 'officer'), // Only Admin and Officers can create groups
  validateRequiredFields(['name']), // Re-added validation
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups (filtered by user's access)
// @access  Private (Admin/Officer see all, others see groups they are members/creators of)
router.get(
  '/',
  filterDataByRole, // Apply data filtering based on user role/group membership
  getAllGroups
);

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private (Admin/Officer/Group Member/Group Creator)
router.get(
  '/:id',
  validateObjectId,
  authorizeGroupAccess('id'), // Ensure user is member/creator or admin/officer
  getGroupById
);

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admin, Officer, or Group Leader with 'can_edit_group_info' permission)
router.put(
  '/:id',
  validateObjectId,
  validateRequiredFields(['name']),
  authorizeGroupPermission('can_edit_group_info', 'id'), // Requires 'can_edit_group_info' in this group
  updateGroup
);

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin only, or highly privileged Officer)
//          Group deletion should be heavily restricted for data integrity.
router.delete(
  '/:id',
  validateObjectId,
  authorize('admin'), // Only admin can delete groups (for now)
  deleteGroup
);

// --- Member Management ---

// @route   POST /api/groups/:id/members
// @desc    Add a member to a group
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members' permission)
router.post(
  '/:id/members',
  validateObjectId,
  validateRequiredFields(['userId']),
  authorizeGroupPermission('can_manage_members', 'id'), // Requires 'can_manage_members' in this group
  addMember
);

// @route   DELETE /api/groups/:id/members
// @desc    Remove a member from a group
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members' permission)
router.delete(
  '/:id/members',
  validateObjectId,
  validateRequiredFields(['userId']),
  authorizeGroupPermission('can_manage_members', 'id'), // Requires 'can_manage_members' in this group
  removeMember
);

// --- Join Group ---

// @route   POST /api/groups/:id/join
// @desc    Allow a user to join a group (self-service)
// @access  Private (Authenticated User - does not require specific group permissions, but will become a member)
//          NOTE: This logic is moved into the controller to keep routes cleaner.
router.post(
  '/:id/join',
  validateObjectId,
  // No specific group permission needed here, as the user is *joining* not managing.
  // The controller will handle logic like invitation-only groups vs. open groups.
  joinGroup // Moved to groupController for cleaner routing and better testability
);

// Group chat functionality is handled by /api/chat routes (separate router)

module.exports = router;
