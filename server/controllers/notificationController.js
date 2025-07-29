// server\controllers\notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User'); // Needed for recipient validation and population
const Group = require('../models/Group'); // Needed for recipient validation and population

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (Admin, Officer, or specific permissions for creating notifications)
exports.createNotification = asyncHandler(async (req, res, next) => {
  const { recipient, recipientModel, type, message, link, isRead, sender } =
    req.body;

  // 1. Basic Validation
  if (!recipient || !recipientModel || !type || !message) {
    return next(
      new ErrorResponse(
        'Recipient, recipient model, type, and message are required.',
        400
      )
    );
  }
  if (!['User', 'Group'].includes(recipientModel)) {
    return next(
      new ErrorResponse(
        'Invalid recipientModel. Must be "User" or "Group".',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(recipient)) {
    return next(new ErrorResponse('Invalid Recipient ID format.', 400));
  }

  // 2. Validate Recipient Exists
  let actualRecipient;
  if (recipientModel === 'User') {
    actualRecipient = await User.findById(recipient);
  } else {
    // 'Group'
    actualRecipient = await Group.findById(recipient);
  }
  if (!actualRecipient) {
    return next(new ErrorResponse(`${recipientModel} not found.`, 404));
  }

  // 3. Access Control (assuming middleware handles 'can_create_notification' permission)
  // For instance, a user might only be able to create notifications for themselves,
  // or an admin/officer for any user/group. This controller assumes the route's
  // middleware ensures the `req.user` has permission to create a notification for `recipient`.

  // 4. Create the notification
  const notification = await Notification.create({
    recipient,
    recipientModel,
    type,
    message,
    link,
    isRead: isRead || false, // Default to unread
    sender: sender || req.user.id, // Defaults to current user if not specified
  });

  // Populate for response
  await notification.populate('recipient', 'name email');
  await notification.populate('sender', 'name email');

  res.status(201).json({
    success: true,
    message: 'Notification created successfully.',
    data: notification,
  });
});

// @desc    Get all notifications for the authenticated user (filtered by role and recipient)
// @route   GET /api/notifications
// @access  Private (filterDataByRole middleware handles access)
exports.getNotifications = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  // For notifications, filterDataByRole should construct a query that fetches:
  // 1. Notifications where recipientModel is 'User' and recipient is req.user._id
  // 2. Notifications where recipientModel is 'Group' and recipient is a group the req.user is a member of
  // 3. (For Admin/Officer) All notifications
  const query = req.dataFilter || {};

  const notifications = await Notification.find(query)
    .populate('recipient', 'name email')
    .populate('sender', 'name email')
    .sort({ createdAt: -1 }); // Sort by latest first

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// @desc    Get a notification by ID
// @route   GET /api/notifications/:id
// @access  Private (authorizeNotificationAccess middleware handles access)
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  let query = { _id: id };
  // Apply data filter from middleware (if any)
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const notification = await Notification.findOne(query)
    .populate('recipient', 'name email')
    .populate('sender', 'name email');

  if (!notification) {
    return next(
      new ErrorResponse(
        'Notification not found or you do not have access.',
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Update a notification by ID (e.g., mark as read)
// @route   PUT /api/notifications/:id
// @access  Private (Recipient or Admin/Officer) - authorizeNotificationAccess or similar middleware
exports.updateNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isRead } = req.body; // Typically, only 'isRead' would be updated by the recipient

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new ErrorResponse('Notification not found.', 404));
  }

  // Specific logic for marking as read.
  // An admin/officer might update other fields, but for general users, 'isRead' is primary.
  if (isRead !== undefined) {
    notification.isRead = isRead;
  } else {
    // If other fields are being updated, ensure proper permissions.
    // For simplicity, we only allow 'isRead' to be updated via this endpoint by general users.
    // Admins/Officers might use a more generic update endpoint.
    return next(
      new ErrorResponse(
        'Only "isRead" status can be updated via this endpoint.',
        400
      )
    );
  }

  await notification.save();

  // Populate for response
  await notification.populate('recipient', 'name email');
  await notification.populate('sender', 'name email');

  res.status(200).json({
    success: true,
    message: 'Notification updated successfully.',
    data: notification,
  });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (Recipient or Admin/Officer)
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new ErrorResponse('Notification not found.', 404));
  }

  // Ensure the current user is the recipient or has admin/officer access to mark as read
  // This check is a crucial part of the authorization middleware (e.g., authorizeNotificationAccess)
  // but a basic sanity check here:
  if (
    notification.recipientModel === 'User' &&
    notification.recipient.toString() !== req.user._id.toString() &&
    !['admin', 'officer'].includes(req.user.role)
  ) {
    return next(
      new ErrorResponse(
        'You are not authorized to mark this notification as read.',
        403
      )
    );
  }
  // If recipientModel is 'Group', any member of that group or admin/officer can mark as read.
  // This more complex group membership check should ideally be in middleware for cleanliness.

  if (notification.isRead) {
    return next(
      new ErrorResponse('Notification is already marked as read.', 400)
    );
  }

  notification.isRead = true;
  await notification.save();

  // Populate for response
  await notification.populate('recipient', 'name email');
  await notification.populate('sender', 'name email');

  res.status(200).json({
    success: true,
    message: 'Notification marked as read.',
    data: notification,
  });
});

// @desc    Delete a notification by ID
// @route   DELETE /api/notifications/:id
// @access  Private (Admin, Officer, or Recipient of a 'User' notification)
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new ErrorResponse('Notification not found.', 404));
  }

  // Unlike financial records, deleting notifications might be acceptable for users.
  // However, for auditability of communications, changing a 'status' to 'archived'
  // or adding an 'isDeleted' flag might be preferable.
  // For now, keeping hard delete, but the decision depends on business requirements.

  // Access control: Only admins/officers or the direct user recipient can delete
  if (!['admin', 'officer'].includes(req.user.role)) {
    if (
      notification.recipientModel === 'User' &&
      notification.recipient.toString() !== req.user._id.toString()
    ) {
      return next(
        new ErrorResponse(
          'You are not authorized to delete this notification.',
          403
        )
      );
    }
    // If it's a group notification, only admins/officers should delete, not individual members.
    if (notification.recipientModel === 'Group') {
      return next(
        new ErrorResponse(
          'Only admins or officers can delete group notifications.',
          403
        )
      );
    }
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully.',
    data: {},
  });
});
