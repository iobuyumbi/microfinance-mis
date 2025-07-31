// server\routes\meetingRoutes.js

const express = require('express');
const router = express.Router();
const {
  scheduleMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  markAttendance,
  deleteMeeting,
} = require('../controllers/meetingController');
const {
  protect,
  authorize, // Keep if you have other uses for generic role authorization
  authorizeGroupPermission, // For specific group-level permissions (e.g., on group creation)
  filterDataByRole,
  authorizeMeetingAccess, // <-- Import your new middleware
} = require('../middleware/auth'); // Ensure this path is correct
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// --- Meeting CRUD Operations ---

router.post(
  '/',
  validateRequiredFields(['group', 'date', 'location']),
  // This middleware should confirm if the user (admin, officer, or group leader)
  // has permission to schedule meetings *for the specified group*.
  // `authorizeGroupPermission` is good if it checks req.body.group.
  authorizeGroupPermission('can_schedule_meetings', 'group'),
  scheduleMeeting
);

router.get(
  '/',
  filterDataByRole('Meeting'), // Filters meetings based on user's groups
  getAllMeetings
);

router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Meeting'), // Filters single meeting if user has access to its group
  getMeetingById
);

router.put(
  '/:id',
  validateObjectId,
  // Use the new middleware for robust meeting-specific authorization
  authorizeMeetingAccess(['can_edit_meeting_info']), // Define what permissions are needed for update
  updateMeeting
);

router.delete(
  '/:id',
  validateObjectId,
  // Use the new middleware for robust meeting-specific authorization
  authorizeMeetingAccess(['can_delete_meetings']), // Define what permissions are needed for delete
  deleteMeeting
);

router.post(
  '/:id/attendance',
  validateObjectId, // Meeting ID
  validateRequiredFields(['userId']), // User ID to mark attendance for
  // This middleware should resolve the meeting's group and check permissions for that group
  authorizeMeetingAccess(['can_record_attendance']), // Define permission for recording attendance
  markAttendance
);

module.exports = router;
