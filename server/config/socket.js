// Socket.IO configuration and handlers
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { checkGroupAccess, createAndSaveChatMessage } = require('../controllers/chatController');

const configureSocket = (server) => {
  // Initialize Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT'],
      credentials: true,
    },
  });

  // Socket.IO Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Socket.IO Connection Handling
  io.on('connection', socket => {
    console.log(
      `User ${socket.user.name} (${socket.user.id}) connected via socket: ${socket.id}`
    );

    // Join a group chat
    socket.on('join-group', async data => {
      try {
        const { groupId } = data;
        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
          throw new Error('Invalid Group ID format provided for joining.');
        }

        await checkGroupAccess(groupId, socket.user.id, socket.user.role);
        const roomId = `group-${groupId}`;
        socket.join(roomId);
        console.log(`User ${socket.user.id} joined group room: ${roomId}`);
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('socket-error', {
          event: 'join-group',
          message: error.message || 'Failed to join group.',
        });
      }
    });

    // Leave a group chat
    socket.on('leave-group', data => {
      try {
        const { groupId } = data;
        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
          throw new Error('Invalid Group ID format provided for leaving.');
        }

        const roomId = `group-${groupId}`;
        socket.leave(roomId);
        console.log(`User ${socket.user.id} left group room: ${roomId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
        socket.emit('socket-error', {
          event: 'leave-group',
          message: error.message || 'Failed to leave group.',
        });
      }
    });

    // Handle chat messages
    socket.on('send-message', async data => {
      try {
        const { message: content, chatId, chatType, groupId } = data;

        if (!content || !chatId || !chatType) {
          throw new Error('Missing required message data.');
        }

        if (chatType === 'group') {
          if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            throw new Error('Invalid or missing Group ID for group message.');
          }
          await checkGroupAccess(groupId, socket.user.id, socket.user.role);
        } else if (chatType === 'admin') {
          if (!['member', 'officer', 'admin'].includes(socket.user.role)) {
            throw new Error(
              'You are not authorized to send messages to admin support.'
            );
          }
        }

        const savedMessage = await createAndSaveChatMessage({
          userId: socket.user.id,
          content,
          chatType,
          chatId,
          groupId: chatType === 'group' ? groupId : undefined
        });
        
        // Emit to the correct room based on chat type
        const roomId = chatType === 'group' ? `group-${groupId}` : chatId;

        io.to(roomId).emit('new_message', {
          message: savedMessage.toJSON(),
          chatId,
          chatType,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('socket-error', {
          event: 'send-message',
          message: error.message || 'Failed to send message',
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', data => {
      const { chatId, isTyping } = data;
      socket.to(chatId).emit('typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} (${socket.user.id}) disconnected`);
    });

    // Generic error listener
    socket.on('error', err => {
      console.error('Socket error (from client or internal):', err);
    });
  });

  return io;
};

module.exports = configureSocket;
