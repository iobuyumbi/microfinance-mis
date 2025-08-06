// server/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} = require('../controllers/groupController');
const { protect, authorize, filterDataByRole } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Protect all group routes (user must be logged in)
router.use(protect);

// --- Group Routes ---

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Admin, Officer)
router.post(
  '/',
  authorize('admin', 'officer'),
  validateRequiredFields(['name', 'location', 'leaderId']),
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups (filtered by user's access)
// @access  Private (Admin, Officer, Leader - filtered)
router.get(
  '/',
  filterDataByRole('Group'), // Data filtering for groups
  getGroups
);

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private (Admin, Officer, Leader - filtered)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Group'), // Ensure user has access to this group's data
  getGroupById
);

// @route   PUT /api/groups/:id
// @desc    Update a group's details
// @access  Private (Admin, Officer, Leader - for their own group)
router.put(
  '/:id',
  authorize('admin', 'officer', 'leader'), // Leaders can update their own group
  validateObjectId,
  updateGroup
);

// @route   DELETE /api/groups/:id
// @desc    Delete/Dissolve a group (soft delete)
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), validateObjectId, deleteGroup);

module.exports = router;
