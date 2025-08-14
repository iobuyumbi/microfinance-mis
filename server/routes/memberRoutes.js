// server/routes/memberRoutes.js
const express = require('express');
const router = express.Router();
const {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats,
} = require('../controllers/memberController');
const { protect, authorize, filterDataByRole } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Protect all member routes (user must be logged in)
router.use(protect);

// --- Member Routes ---

// @route   POST /api/members
// @desc    Create a new member (user with member role)
// @access  Private (Admin, Officer)
router.post(
  '/',
  authorize('admin', 'officer'),
  validateRequiredFields(['name', 'email', 'password']), // Basic fields for user creation
  createMember
);

// @route   GET /api/members
// @desc    Get all members (filtered by user role)
// @access  Private (Admin, Officer, Leader - filtered)
router.get(
  '/',
  filterDataByRole('User'), // Data filtering based on user role
  getMembers
);

// @route   GET /api/members/stats
// @desc    Get member statistics (counts by status)
// @access  Private (Admin, Officer, Leader)
router.get('/stats', authorize('admin', 'officer', 'leader'), getMemberStats);

// @route   GET /api/members/:id
// @desc    Get a single member by ID
// @access  Private (Admin, Officer, Leader - filtered, Member - self)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('User'), // Ensure user has access to this member's data
  getMemberById
);

// @route   PUT /api/members/:id
// @desc    Update a member's details
// @access  Private (Admin, Officer - limited)
router.put(
  '/:id',
  authorize('admin', 'officer'), // Officers can update members in their groups
  validateObjectId,
  updateMember
);

// @route   DELETE /api/members/:id
// @desc    Delete/Deactivate a member (soft delete)
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), validateObjectId, deleteMember);

module.exports = router;
