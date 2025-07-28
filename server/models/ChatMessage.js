const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    chatType: {
      type: String,
      enum: ['group', 'admin', 'direct'],
      required: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true, // For faster queries
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: function () {
        return this.chatType === 'group';
      },
    },
    // Message metadata
    messageType: {
      type: String,
      enum: ['text', 'notification', 'system'],
      default: 'text',
    },
    // For message reactions (future feature)
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reaction: {
          type: String,
          enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
        },
      },
    ],
    // For message editing
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    // For message deletion
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
chatMessageSchema.index({ chatId: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1, createdAt: -1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function () {
  return this.createdAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Ensure virtuals are serialized
chatMessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
