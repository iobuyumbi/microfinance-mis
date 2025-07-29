// server\controllers\notificationController.js (REVISED)
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

  // 1. Basic Validation (already handled by validateRequiredFields for essential fields)
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

  // Access Control handled by route middleware (e.g., authorize('admin', 'officer'))

  // 3. Create the notification
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
// @access  Private (filterDataByRole middleware handles access)
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  let query = { _id: id, ...(req.dataFilter || {}) }; // Combine with filterDataByRole

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
// @access  Private (Recipient or Admin/Officer) - filterDataByRole middleware
exports.updateNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isRead, type, message, link } = req.body; // Allow more fields for admin/officer update

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const notification = await Notification.findOne(query);

  if (!notification) {
    return next(
      new ErrorResponse(
        'Notification not found or you do not have permission to update.',
        404
      )
    );
  }

  // Determine what fields can be updated based on role, if not using a separate route for `markAsRead`
  // For now, allow general updates for admins/officers.
  // General users should primarily use the markAsRead endpoint.
  // If req.user is an admin/officer, they can update more fields.
  if (req.user.role === 'admin' || req.user.role === 'officer') {
    if (type !== undefined) notification.type = type;
    if (message !== undefined) notification.message = message;
    if (link !== undefined) notification.link = link;
    if (isRead !== undefined) notification.isRead = isRead;
  } else {
    // For regular users, only allow updating isRead
    if (isRead !== undefined) {
      notification.isRead = isRead;
    } else {
      return next(
        new ErrorResponse(
          'Only "isRead" status can be updated by regular users.',
          400
        )
      );
    }
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
// @access  Private (Recipient or Admin/Officer) - filterDataByRole will ensure access
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const notification = await Notification.findOne(query);

  if (!notification) {
    return next(
      new ErrorResponse(
        'Notification not found or you do not have permission to mark as read.',
        404
      )
    );
  }

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

// @desc    Delete a notification by ID (soft delete)
// @route   DELETE /api/notifications/:id
// @access  Private (Admin, Officer, or Recipient of a 'User' notification) - filterDataByRole handles access
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Notification ID format.', 400));
  }

  // Combine _id from params with req.dataFilter for robust access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  const notification = await Notification.findOne(query);

  if (!notification) {
    return next(
      new ErrorResponse(
        'Notification not found or you do not have permission to delete.',
        404
      )
    );
  }

  // Implement soft delete
  if (notification.isDeleted) {
    return next(new ErrorResponse('Notification is already deleted.', 400));
  }

  notification.isDeleted = true;
  notification.deletedAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification soft-deleted successfully.',
    data: {},
  });
});
