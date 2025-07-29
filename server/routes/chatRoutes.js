// server\routes\chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  getChatMessages,
  sendMessage,
  getChatChannels,
  editMessage,
  deleteMessage,
  markAsRead,
  getChatStats,
} = require('../controllers/chatController'); // Assuming this controller exists and is refactored
const {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
} = require('../middleware/auth'); // Import necessary auth middleware
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router.
// All chat operations should require an authenticated user.
router.use(protect);

// @route   GET /api/chat/channels
// @desc    Get available chat channels for the authenticated user
// @access  Private (User must be authenticated)
router.get('/channels', getChatChannels);

// @route   GET /api/chat/messages
// @desc    Get chat messages for a specific channel/chat ID
// @access  Private (User must be a member of the chat/channel)
// NOTE: The controller will need to implement logic to ensure the user is authorized to view messages in the requested chat.
router.get('/messages', getChatMessages);

// @route   POST /api/chat/messages
// @desc    Send a new message to a chat channel
// @access  Private (User must be a member of the chat/channel)
// NOTE: The controller will need to implement logic to ensure the user is authorized to send messages to the requested chat.
router.post(
  '/messages',
  validateRequiredFields(['content', 'chatId', 'chatType']), // Ensure chatId and chatType (e.g., 'direct', 'group') are passed
  sendMessage
);

// @route   PUT /api/chat/messages/:messageId
// @desc    Edit an existing message
// @access  Private (Message owner, or Admin/Officer)
router.put(
  '/messages/:messageId',
  validateObjectId,
  validateRequiredFields(['content']),
  // authorizeOwnerOrAdmin will need to be configured to check ownership of the Message
  // or the controller will enforce this. For chat, it's often the message sender.
  // If messages have an 'author' field, authorizeOwnerOrAdmin('Message', 'author') would work.
  // For now, let's leave it to the controller if `authorizeOwnerOrAdmin` is not set up for `Message` model directly.
  editMessage
);

// @route   DELETE /api/chat/messages/:messageId
// @desc    Delete an existing message
// @access  Private (Message owner, Admin, Officer, or Group Leader if group chat)
router.delete(
  '/messages/:messageId',
  validateObjectId,
  // Similar to edit, apply authorizeOwnerOrAdmin if Message has an 'author' field.
  // Also consider if group leaders or chat admins can delete messages.
  deleteMessage
);

// @route   POST /api/chat/messages/read
// @desc    Mark messages as read for the authenticated user
// @access  Private (User must be authenticated)
router.post(
  '/messages/read',
  validateRequiredFields(['chatId', 'messageIds']), // chatId might be optional if messages are unique across chats, but good for context
  markAsRead
);

// @route   GET /api/chat/stats
// @desc    Get chat statistics (e.g., unread counts, total messages) for the authenticated user
// @access  Private (User must be authenticated)
router.get('/stats', getChatStats);

module.exports = router;
