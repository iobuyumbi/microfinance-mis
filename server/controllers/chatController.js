const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Group = require('../models/Group');

// Get chat messages for a specific chat
exports.getChatMessages = async (req, res, next) => {
  try {
    const { chatId, chatType, groupId } = req.query;
    const { limit = 50, offset = 0 } = req.query;

    // Validate required parameters
    if (!chatId || !chatType) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and chat type are required',
      });
    }

    // Check access permissions based on chat type
    if (chatType === 'group') {
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'Group ID is required for group chats',
        });
      }

      // Check if user is a member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isMember =
        group.members.includes(req.user.id) ||
        group.createdBy.toString() === req.user.id;
      if (
        !isMember &&
        req.user.role !== 'admin' &&
        req.user.role !== 'officer'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to group chat',
        });
      }
    }

    // Build query
    const query = {
      chatId,
      chatType,
      deleted: false,
    };

    if (chatType === 'group' && groupId) {
      query.groupId = groupId;
    }

    // Get messages with pagination
    const messages = await ChatMessage.find(query)
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get total count for pagination
    const totalCount = await ChatMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + messages.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Send a new message
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, chatId, chatType, groupId } = req.body;

    // Validate required fields
    if (!content || !chatId || !chatType) {
      return res.status(400).json({
        success: false,
        message: 'Content, chat ID, and chat type are required',
      });
    }

    // Check access permissions
    if (chatType === 'group') {
      if (!groupId) {
        return res.status(400).json({
          success: false,
          message: 'Group ID is required for group chats',
        });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isMember =
        group.members.includes(req.user.id) ||
        group.createdBy.toString() === req.user.id;
      if (
        !isMember &&
        req.user.role !== 'admin' &&
        req.user.role !== 'officer'
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to group chat',
        });
      }
    }

    // Create new message
    const message = new ChatMessage({
      sender: req.user.id,
      content: content.trim(),
      chatType,
      chatId,
      groupId: chatType === 'group' ? groupId : undefined,
      messageType: 'text',
    });

    await message.save();

    // Populate sender information
    await message.populate('sender', 'name email');

    // Emit real-time message to connected clients
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('new_message', {
        message: message.toJSON(),
        chatId,
        chatType,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Get available chat channels for user
exports.getChatChannels = async (req, res, next) => {
  try {
    const channels = [];

    // Add admin chat for all users
    channels.push({
      id: 'admin-chat',
      name: 'Admin Support',
      type: 'admin',
      description: 'General support and inquiries',
      unreadCount: 0, // TODO: Implement unread count
    });

    // Get user's groups for group chats
    const userGroups = await Group.find({
      $or: [{ members: req.user.id }, { createdBy: req.user.id }],
    });

    const groupChannels = userGroups.map(group => ({
      id: `group-${group._id}`,
      name: group.name,
      type: 'group',
      groupId: group._id,
      description: `${group.members.length} members`,
      unreadCount: 0, // TODO: Implement unread count
    }));

    channels.push(...groupChannels);

    res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    next(error);
  }
};

// Edit a message
exports.editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required',
      });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user can edit this message
    if (
      message.sender.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Update message
    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(message.chatId).emit('message_updated', {
        message: message.toJSON(),
        chatId: message.chatId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user can delete this message
    if (
      message.sender.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete
    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    // Emit real-time deletion
    const io = req.app.get('io');
    if (io) {
      io.to(message.chatId).emit('message_deleted', {
        messageId: message._id,
        chatId: message.chatId,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { chatId, messageIds } = req.body;

    if (!chatId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID and message IDs array are required',
      });
    }

    // Update messages to mark as read
    await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
        chatId,
        sender: { $ne: req.user.id }, // Don't mark own messages as read
      },
      {
        $addToSet: { readBy: req.user.id },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// Get chat statistics
exports.getChatStats = async (req, res, next) => {
  try {
    const { chatId, groupId } = req.query;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'Chat ID is required',
      });
    }

    // Get message count
    const messageCount = await ChatMessage.countDocuments({
      chatId,
      deleted: false,
    });

    // Get unique participants
    const participants = await ChatMessage.distinct('sender', {
      chatId,
      deleted: false,
    });

    // Get recent activity
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
        recentMessages.length > 0 ? recentMessages[0].createdAt : null,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
