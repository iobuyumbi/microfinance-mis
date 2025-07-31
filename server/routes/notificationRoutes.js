// server\routes\notificationRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  markNotificationAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, authorize, filterDataByRole } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

router.use(protect);

router.post(
  '/',
  authorize('admin', 'officer'), // Removed 'title' from required fields as per schema adjustment
  validateRequiredFields(['recipient', 'recipientModel', 'type', 'message']),
  createNotification
);

router.get('/', filterDataByRole('Notification'), getNotifications);

router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'),
  getNotificationById
);

router.put(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'),
  updateNotification
);

router.put(
  '/:id/read',
  validateObjectId,
  filterDataByRole('Notification'),
  markNotificationAsRead
);

router.delete(
  '/:id',
  validateObjectId,
  filterDataByRole('Notification'), // IMPORTANT: The `authorize('admin', 'officer')` here means only admins/officers can delete.
  // If regular users (recipients of User-model notifications) should be able to delete THEIR OWN,
  // then you would remove this `authorize` middleware, and rely solely on `filterDataByRole`
  // to determine if the user has permission to delete that specific notification.
  // For now, I'll keep it as it's a stricter, safer default.
  authorize('admin', 'officer'),
  deleteNotification
);

module.exports = router;
