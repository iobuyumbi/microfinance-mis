// server\controllers\chatController.js
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User'); // Still needed for populate path, though not directly queried here
const Group = require('../models/Group');
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const mongoose = require('mongoose'); // Import mongoose for ObjectId conversion

// Helper to check group membership and roles
// Throws errors with messages that errorHandler can interpret
const checkGroupAccess = async (groupId, userId, userRole) => {
  // Ensure groupId is a valid ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const error = new Error('Invalid Group ID format.');
    error.statusCode = 400;
    throw error;
  }

  const group = await Group.findById(groupId);
  if (!group) {
    const error = new Error('Group not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ensure userId is consistently a string for comparison
  const userIdString = userId.toString();

  const isMember = group.members.some(
    memberId => memberId.toString() === userIdString
  );
  const isLeader = group.leader.toString() === userIdString;

  if (!(isMember || isLeader) && !['admin', 'officer'].includes(userRole)) {
    const error = new Error('Access denied to this group chat.');
    error.statusCode = 403;
    throw error;
  }
  return group; // Return group for further use if needed
};

// @desc    Get chat messages for a specific chat
// @route   GET /api/chat/messages
// @access  Private
exports.getChatMessages = asyncHandler(async (req, res) => {
  const { chatId, chatType, groupId } = req.query;
  const { limit = 50, offset = 0 } = req.query; // Default pagination values

  // Validate required parameters
  if (!chatId || !chatType) {
    res.status(400);
    throw new Error('Chat ID and chat type are required.');
  }

  // Check access permissions based on chat type
  if (chatType === 'group') {
    if (!groupId) {
      res.status(400);
      throw new Error('Group ID is required for group chats.');
    }
    await checkGroupAccess(groupId, req.user.id, req.user.role); // Use helper for access check
  } else if (chatType === 'admin') {
    // For 'admin' chat type, you might have specific rules, e.g., only admins/officers/members can chat with admin
    // For now, assuming anyone can access if it's 'admin-chat'
    if (chatId !== 'admin-chat') {
      res.status(400);
      throw new Error('Invalid chat ID for admin chat type.');
    }
  } else {
    res.status(400);
    throw new Error('Invalid chat type specified.');
  }

  // Build query
  const query = {
    chatId,
    chatType,
    deleted: false, // Exclude soft-deleted messages
  };

  if (chatType === 'group' && groupId) {
    query.groupId = groupId; // Add groupId to query for group chats
  }

  // Get messages with pagination
  const messages = await ChatMessage.find(query)
    .populate('sender', 'name email') // Populate sender details
    .sort({ createdAt: -1 }) // Sort by latest first
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  // Get total count for pagination
  const totalCount = await ChatMessage.countDocuments(query);

  res.status(200).json({
    success: true,
    data: messages.reverse(), // Reverse to display in chronological order
    pagination: {
      total: totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: totalCount > parseInt(offset) + messages.length,
    },
  });
});

// Extracted core message creation logic
exports.createAndSaveChatMessage = async (messageData) => {
  const { userId, content, chatType, chatId, groupId } = messageData;
  
  const message = new ChatMessage({
    sender: userId,
    content: content.trim(),
    chatType,
    chatId,
    groupId: chatType === 'group' ? groupId : undefined,
    messageType: 'text',
  });
  await message.save();
  await message.populate('sender', 'name email'); // Populate for immediate use
  return message;
};

// @desc    Send a new message (HTTP route)
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, chatType, groupId } = req.body;

  // Validate required fields (as before)
  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Message content cannot be empty.');
  }
  if (!chatId || !chatType) {
    res.status(400);
    throw new Error('Chat ID and chat type are required.');
  }

  // Check access permissions (as before)
  if (chatType === 'group') {
    if (!groupId) {
      res.status(400);
      throw new Error('Group ID is required for group chats.');
    }
    await checkGroupAccess(groupId, req.user.id, req.user.role);
  } else if (chatType === 'admin') {
    if (chatId !== 'admin-chat') {
      res.status(400);
      throw new Error('Invalid chat ID for admin chat type.');
    }
    if (!['member', 'leader', 'officer', 'admin'].includes(req.user.role)) {
      res.status(403);
      throw new Error(
        'You are not authorized to send messages to admin support.'
      );
    }
  } else {
    res.status(400);
    throw new Error('Invalid chat type specified.');
  }

  const message = await exports.createAndSaveChatMessage({
    userId: req.user.id,
    content,
    chatType,
    chatId,
    groupId
  });

  // Emit real-time message to connected clients
  const io = req.app.get('io');
  if (io) {
    // Emit to the correct room based on chat type
    const roomId = chatType === 'group' ? `group-${groupId}` : chatId;
    io.to(roomId).emit('new_message', {
      message: message.toJSON(),
      chatId,
      chatType,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully.',
    data: message,
  });
});

// @desc    Get available chat channels for user
// @route   GET /api/chat/channels
// @access  Private
exports.getChatChannels = asyncHandler(async (req, res) => {
  const channels = [];

  // Add admin chat for all users who can interact with admin
  // Consider roles that can initiate or participate in admin chat
  if (['member', 'leader', 'officer', 'admin'].includes(req.user.role)) {
    channels.push({
      id: 'admin-chat',
      name: 'Admin Support',
      type: 'admin',
      description: 'General support and inquiries.',
      unreadCount: 0, // TODO: Implement real-time unread count logic
    });
  }

  // Get user's groups for group chats
  const userGroups = await Group.find({
    $or: [{ members: req.user.id }, { leader: req.user.id }],
  }).select('name members leader'); // Select only necessary fields

  const groupChannels = userGroups.map(group => ({
    id: `group-${group._id.toString()}`, // Ensure consistent string ID for client
    name: group.name,
    type: 'group',
    groupId: group._id.toString(), // Ensure consistent string ID
    description: `${group.members.length} members`,
    unreadCount: 0, // TODO: Implement real-time unread count logic
  }));

  channels.push(...groupChannels);

  res.status(200).json({
    success: true,
    data: channels,
  });
});

// @desc    Edit a message
// @route   PUT /api/chat/messages/:messageId
// @access  Private
exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    res.status(400);
    throw new Error('Content cannot be empty for message edit.');
  }

  // Validate messageId format
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    res.status(400);
    throw new Error('Invalid message ID format.');
  }

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found.');
  }

  // Check if user can edit this message (sender or admin)
  if (
    message.sender.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You are not authorized to edit this message.');
  }

  // Update message details
  message.content = content.trim();
  message.edited = true;
  message.editedAt = new Date(); // Set editedAt on update

  await message.save();
  await message.populate('sender', 'name email'); // Re-populate sender after save for consistent response

  // Emit real-time update to clients in the chat room
  const io = req.app.get('io');
  if (io) {
    io.to(message.chatId).emit('message_updated', {
      message: message.toJSON(),
      chatId: message.chatId,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Message updated successfully.',
    data: message,
  });
});

// @desc    Soft delete a message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  // Validate messageId format
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    res.status(400);
    throw new Error('Invalid message ID format.');
  }

  const message = await ChatMessage.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found.');
  }

  // Check if user can delete this message (sender or admin)
  if (
    message.sender.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You are not authorized to delete this message.');
  }

  // Perform soft delete
  message.deleted = true;
  message.deletedAt = new Date();
  await message.save();

  // Emit real-time deletion event
  const io = req.app.get('io');
  if (io) {
    io.to(message.chatId).emit('message_deleted', {
      messageId: message._id.toString(), // Send message ID as string
      chatId: message.chatId,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Message soft-deleted successfully.',
  });
});

// @desc    Mark messages as read
// @route   PUT /api/chat/mark-read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { chatId, messageIds } = req.body;

  if (
    !chatId ||
    !messageIds ||
    !Array.isArray(messageIds) ||
    messageIds.length === 0
  ) {
    res.status(400);
    throw new Error(
      'Chat ID and a non-empty array of message IDs are required.'
    );
  }

  // Convert string IDs to Mongoose ObjectIds for the query
  const objectMessageIds = messageIds.map(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid message ID format found: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
  });

  // Update messages to mark as read by adding current user's ID to 'readBy' set
  await ChatMessage.updateMany(
    {
      _id: { $in: objectMessageIds },
      chatId,
      sender: { $ne: req.user.id }, // Prevent marking own messages as read
      readBy: { $ne: req.user.id }, // Only update if not already marked as read by this user
    },
    {
      $addToSet: { readBy: req.user.id }, // Add user's ID to the readBy array as a set
    }
  );

  res.status(200).json({
    success: true,
    message: 'Messages marked as read successfully.',
  });
});

// @desc    Get chat statistics
// @route   GET /api/chat/stats
// @access  Private
exports.getChatStats = asyncHandler(async (req, res) => {
  const { chatId, chatType, groupId } = req.query; // Include chatType and groupId for potential access checks

  if (!chatId) {
    res.status(400);
    throw new Error('Chat ID is required for chat statistics.');
  }

  // Access control for stats (similar to getting messages)
  if (chatType === 'group') {
    if (!groupId) {
      res.status(400);
      throw new Error('Group ID is required for group chat statistics.');
    }
    await checkGroupAccess(groupId, req.user.id, req.user.role);
  } else if (chatType === 'admin') {
    if (chatId !== 'admin-chat') {
      res.status(400);
      throw new Error('Invalid chat ID for admin chat statistics.');
    }
    // Assuming anyone with access to channels can view stats, or add specific role check
  } else {
    res.status(400);
    throw new Error('Invalid chat type specified for statistics.');
  }

  // Get total message count (excluding deleted messages)
  const messageCount = await ChatMessage.countDocuments({
    chatId,
    deleted: false,
  });

  // Get unique participants (distinct senders, excluding deleted messages)
  const participants = await ChatMessage.distinct('sender', {
    chatId,
    deleted: false,
  });

  // Get the 5 most recent messages (excluding deleted) and populate sender info
  const recentMessages = await ChatMessage.find({
    chatId,
    deleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('sender', 'name email');

  const stats = {
    chatId,
    messageCount,
    participantCount: participants.length,
    recentMessages,
    lastActivity:
      recentMessages.length > 0 ? recentMessages[0].createdAt : null, // Timestamp of the latest message
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});
