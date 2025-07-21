const express = require("express");
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Notification routes - all protected
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields(["recipient", "title", "message"]),
    createNotification
  )
  .get(getNotifications);

router
  .route("/:id")
  .get(validateObjectId, getNotificationById)
  .put(validateObjectId, updateNotification)
  .delete(validateObjectId, deleteNotification);

module.exports = router;
