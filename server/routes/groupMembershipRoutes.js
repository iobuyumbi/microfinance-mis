// server/routes/groupMembershipRoutes.js
const express = require('express');
const router = express.Router();
const {
  addMemberToGroup,
  removeMemberFromGroup,
  updateMemberRoleInGroup,
} = require('../controllers/groupMembershipController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Protect all group membership routes (user must be logged in)
router.use(protect);

// --- Group Membership Routes ---

// @route   POST /api/members/:memberId/groups/:groupId
// @desc    Add an existing user to a group
// @access  Private (Admin, Officer)
router.post(
  '/:memberId/groups/:groupId',
  authorize('admin', 'officer'),
  validateObjectId, // Validate memberId and groupId from params
  addMemberToGroup
);

// @route   PUT /api/members/:memberId/groups/:groupId/role
// @desc    Update a member's role within a group
// @access  Private (Admin, Officer)
router.put(
  '/:memberId/groups/:groupId/role',
  authorize('admin', 'officer'),
  validateObjectId,
  validateRequiredFields(['roleInGroup']),
  updateMemberRoleInGroup
);

// @route   DELETE /api/members/:memberId/groups/:groupId
// @desc    Remove a member from a group (soft delete membership)
// @access  Private (Admin, Officer)
router.delete(
  '/:memberId/groups/:groupId',
  authorize('admin', 'officer'),
  validateObjectId,
  removeMemberFromGroup
);

module.exports = router;
