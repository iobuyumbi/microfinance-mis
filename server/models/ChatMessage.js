// server\models\ChatMessage.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Added index for sender
    },
    content: {
      // Renamed from 'message' for clarity, though 'message' is fine too.
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    chatType: {
      // 'group', 'admin', 'direct'
      type: String,
      enum: ['group', 'admin', 'direct'],
      required: true,
      index: true, // Added index for chatType
    },
    chatId: {
      // Unique identifier for a chat conversation (e.g., group ID for group chat, or concatenated user IDs for direct chat)
      type: String,
      required: true,
      index: true, // Essential for faster queries within a specific chat
    },
    groupId: {
      // Specific reference for 'group' chatType
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required () {
        return this.chatType === 'group';
      },
      index: true, // Added index for groupId
    },
    // Message metadata
    messageType: {
      // 'text', 'notification', 'system' (e.g., 'User X joined the group')
      type: String,
      enum: ['text', 'notification', 'system'],
      default: 'text',
      index: true, // Added index for messageType
    },
    // For message reactions (future feature)
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true, // Ensure userId is always present for a reaction
        },
        reaction: {
          type: String,
          enum: ['👍', '❤️', '😂', '😮', '😢', '😡', '🙏', '💯'], // Expanded emojis for more options
          required: true, // Ensure reaction type is always present
        },
        _id: false, // Don't create an _id for subdocuments if not needed
      },
    ],
    // For message editing
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    // For message deletion (soft delete)
    deleted: {
      type: Boolean,
      default: false,
      index: true, // Added index for deleted status
    },
    deletedAt: Date,
    // Optional: readBy for direct/admin messages if needed for read receipts
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        _id: false,
        index: true, // Index if you frequently query by readBy user
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying a chat's messages, sorted by creation date
chatMessageSchema.index({ chatId: 1, createdAt: -1 });

// Index for sender and chatType
chatMessageSchema.index({ sender: 1, chatType: 1, createdAt: -1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function () {
  return this.createdAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtuals are serialized
chatMessageSchema.set('toJSON', { virtuals: true });
chatMessageSchema.set('toObject', { virtuals: true }); // Also for toObject

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
