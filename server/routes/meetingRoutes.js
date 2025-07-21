const express = require("express");
const router = express.Router();
const {
  scheduleMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  markAttendance,
  deleteMeeting,
} = require("../controllers/meetingController");
const { protect } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Meeting routes - all protected
router.use(protect);

router
  .route("/")
  .post(validateRequiredFields(["group", "date", "location"]), scheduleMeeting)
  .get(getAllMeetings);

router
  .route("/:id")
  .get(validateObjectId, getMeetingById)
  .put(validateObjectId, updateMeeting)
  .delete(validateObjectId, deleteMeeting);

router.post(
  "/:id/attendance",
  validateObjectId,
  validateRequiredFields(["userId"]),
  markAttendance
);

module.exports = router;
