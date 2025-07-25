const Notification = require("../models/Notification");

// Helper to handle 404
const handleNotFound = (res, entity, name = "Notification") => {
  if (!entity) {
    return res.status(404).json({ error: `${name} not found` });
  }
  return res.json(entity);
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

// Get all notifications
exports.getNotifications = async (req, res, next) => {
  try {
    let notifications;
    if (["admin", "officer"].includes(req.user.role)) {
      notifications = await Notification.find();
    } else {
      // If Notification has a group field, filter by user's groups
      const Group = require("../models/Group");
      const userGroups = await Group.find({ members: req.user._id }).distinct("_id");
      notifications = await Notification.find({ group: { $in: userGroups } });
    }
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// Get a notification by ID
exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    handleNotFound(res, notification);
  } catch (error) {
    next(error);
  }
};

// Update a notification by ID
exports.updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    handleNotFound(res, notification);
  } catch (error) {
    next(error);
  }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};
