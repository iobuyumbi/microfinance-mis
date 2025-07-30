// server\routes\groupRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember, // Ensure this is imported
  joinGroup,
  updateMemberRole, // Added for consistency with groupController
  getGroupMembers, // Added for consistency with groupController
} = require('../controllers/groupController');
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
// @access  Private (Admin, Officer)
router.post(
  '/',
  authorize('admin', 'officer'),
  validateRequiredFields(['name', 'location', 'meetingFrequency', 'leaderId']), // Added more required fields here
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups (filtered by user's access)
// @access  Private (Admin/Officer see all, others see groups they are members/creators of)
router.get('/', filterDataByRole('Group'), getAllGroups);

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private (Admin/Officer/Group Member/Group Creator)
router.get('/:id', validateObjectId, authorizeGroupAccess('id'), getGroupById);

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admin, Officer, or Group Leader with 'can_edit_group_info' permission)
router.put(
  '/:id',
  validateObjectId,
  // validateRequiredFields(['name']), // Removed: allow partial updates, controller handles defaults
  authorizeGroupPermission('can_edit_group_info', 'id'),
  updateGroup
);

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin only, or highly privileged Officer)
router.delete('/:id', validateObjectId, authorize('admin'), deleteGroup);

// --- Member Management (within a group) ---

// @route   POST /api/groups/:id/members
// @desc    Add a member to a group
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members' permission)
router.post(
  '/:id/members', // :id is groupId
  validateObjectId,
  validateRequiredFields(['userId']),
  authorizeGroupPermission('can_manage_members', 'id'),
  addMember
);

// @route   DELETE /api/groups/:id/members/:userId
// @desc    Remove a member from a group
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_members' permission)
router.delete(
  '/:id/members/:userId', // :id is groupId, :userId is member to remove
  validateObjectId, // Validates :id
  // No need for validateRequiredFields(['userId']) as it's a param
  authorizeGroupPermission('can_manage_members', 'id'),
  removeMember
);

// @route   PUT /api/groups/:groupId/members/:userId/role
// @desc    Update a member's role within a group
// @access  Private (authorizeGroupPermission('can_manage_roles') or Admin/Officer)
router.put(
  '/:groupId/members/:userId/role',
  validateObjectId, // Validates :groupId
  validateObjectId, // Validates :userId
  validateRequiredFields(['newRoleName']),
  authorizeGroupPermission('can_manage_roles', 'groupId'), // Assuming 'can_manage_roles' is the permission
  updateMemberRole
);

// @route   GET /api/groups/:groupId/members
// @desc    Get members of a specific group with their roles
// @access  Private (authorizeGroupAccess or Admin/Officer)
router.get(
  '/:groupId/members',
  validateObjectId, // Validates :groupId
  authorizeGroupAccess('groupId'),
  getGroupMembers
);

// --- Join Group ---

// @route   POST /api/groups/:id/join
// @desc    Allow a user to join a group (self-service)
// @access  Private (Authenticated User)
router.post('/:id/join', validateObjectId, joinGroup);

module.exports = router;
