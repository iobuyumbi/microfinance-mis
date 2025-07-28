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
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// All routes are protected
router.use(protect);

// Get available chat channels
router.get('/channels', getChatChannels);

// Get chat messages
router.get('/messages', getChatMessages);

// Send a new message
router.post(
  '/messages',
  validateRequiredFields(['content', 'chatId', 'chatType']),
  sendMessage
);

// Edit a message
router.put(
  '/messages/:messageId',
  validateObjectId,
  validateRequiredFields(['content']),
  editMessage
);

// Delete a message
router.delete('/messages/:messageId', validateObjectId, deleteMessage);

// Mark messages as read
router.post(
  '/messages/read',
  validateRequiredFields(['chatId', 'messageIds']),
  markAsRead
);

// Get chat statistics
router.get('/stats', getChatStats);

module.exports = router;
