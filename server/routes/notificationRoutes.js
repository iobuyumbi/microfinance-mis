// server\routes\notificationRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  markNotificationAsRead, // New import for specific read endpoint
  deleteNotification,
} = require('../controllers/notificationController');
const {
  protect,
  authorize,
  filterDataByRole, // Import filterDataByRole
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Notification routes - all protected
router.use(protect);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private (Admin, Officer) - typically system or privileged users create notifications
router.post(
  '/',
  authorize('admin', 'officer'), // Only admins/officers can create notifications
  validateRequiredFields(['recipient', 'recipientModel', 'type', 'message']), // Added recipientModel and type
  createNotification
);

// @route   GET /api/notifications
// @desc    Get all notifications for the authenticated user (filtered by access)
// @access  Private (filterDataByRole middleware handles access: self, group member, admin/officer)
router.get(
  '/',
  filterDataByRole('Notification'), // Filters notifications based on user's recipient/group membership
  getNotifications
);

// @route   GET /api/notifications/:id
// @desc    Get a single notification by ID
// @access  Private (Recipient or Admin/Officer - via filterDataByRole)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'), // Ensures user can only view notifications they have access to
  getNotificationById
);

// @route   PUT /api/notifications/:id
// @desc    Update a notification by ID (primarily for Admin/Officer to edit details, or recipient to mark as read if not using specific endpoint)
// @access  Private (Recipient for 'isRead', Admin/Officer for full edit)
router.put(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'), // Ensures user can only update notifications they have access to
  updateNotification
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private (Recipient or Admin/Officer)
router.put(
  '/:id/read',
  validateObjectId,
  filterDataByRole('Notification'), // Ensures user can only mark notifications they have access to as read
  markNotificationAsRead
);

// @route   DELETE /api/notifications/:id
// @desc    Soft delete a notification by ID
// @access  Private (Recipient of 'User' notification, Admin, Officer)
router.delete(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'), // Allows recipient to delete their own notification
  authorize('admin', 'officer'), // Admins and officers can delete any notification (combines with filter for recipient)
  deleteNotification
);

module.exports = router;
