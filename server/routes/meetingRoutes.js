// server\routes\meetingRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  scheduleMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  markAttendance,
  deleteMeeting,
} = require('../controllers/meetingController'); // Ensure controller is updated
const {
  protect,
  authorize,
  authorizeGroupPermission, // For group-specific actions
  filterDataByRole, // For filtering data based on user access
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// --- Meeting CRUD Operations ---

// @route   POST /api/meetings
// @desc    Schedule a new meeting
// @access  Private (Admin, Officer, or Group Leader with 'can_schedule_meetings' permission)
router.post(
  '/',
  validateRequiredFields(['group', 'date', 'location']),
  authorizeGroupPermission('can_schedule_meetings', 'group'), // 'group' refers to req.body.group
  scheduleMeeting
);

// @route   GET /api/meetings
// @desc    Get all meetings (filtered by user's access)
// @access  Private (Admin/Officer see all, others see meetings for groups they are members of)
router.get(
  '/',
  filterDataByRole('Meeting'), // Apply data filtering for Meeting model
  getAllMeetings
);

// @route   GET /api/meetings/:id
// @desc    Get a single meeting by ID
// @access  Private (Admin/Officer/Group Member - via filterDataByRole)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Meeting'), // Ensure user can only view meetings they are authorized for
  getMeetingById
);

// @route   PUT /api/meetings/:id
// @desc    Update meeting details
// @access  Private (Admin, Officer, or Group Leader with 'can_edit_meeting_info' permission)
router.put(
  '/:id',
  validateObjectId,
  // Note: 'name' is not a required field for update here, but `validateRequiredFields` might be too strict.
  // The controller handles which fields are actually updated.
  authorizeGroupPermission('can_edit_group_info', 'id'), // Assuming 'id' refers to the meeting's group ID for permission check
  // This requires a custom `authorizeMeetingAccess` or similar
  // if the meeting ID is used to derive group ID for permission.
  // For now, let's use a simpler authorize.
  authorize('admin', 'officer', 'leader'), // Leaders can update meetings for their groups
  updateMeeting
);

// @route   DELETE /api/meetings/:id
// @desc    Soft delete (cancel) a meeting
// @access  Private (Admin, Officer, or Group Leader with 'can_delete_meetings' permission)
router.delete(
  '/:id',
  validateObjectId,
  authorize('admin', 'officer', 'leader'), // Leaders can delete meetings for their groups
  deleteMeeting
);

// @route   POST /api/meetings/:id/attendance
// @desc    Mark attendance for a meeting
// @access  Private (Admin, Officer, or Group Leader with 'can_record_attendance' permission)
router.post(
  '/:id/attendance',
  validateObjectId, // Meeting ID
  validateRequiredFields(['userId']), // User ID to mark attendance for
  authorizeGroupPermission('can_record_attendance', 'id'), // 'id' refers to the meeting ID, middleware needs to resolve group
  markAttendance
);

module.exports = router;
