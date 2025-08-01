// Microfinance MIS - Main Server Entry

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken'); // Assuming JWT for auth
const User = require('./models/User'); // Your User model
const healthRoutes = require('./routes/healthRoutes');

// IMPORTANT: Import the specific functions you need directly
const {
  checkGroupAccess,
  createAndSaveChatMessage,
} = require('./controllers/chatController');

// Import configurations
const { connectDB } = require('./config');

// Import middleware
const { errorHandler, notFound } = require('./middleware');

// Import all routes
const {
  authRoutes,
  userRoutes,
  groupRoutes,
  loanRoutes,
  savingsRoutes,
  transactionRoutes,
  meetingRoutes,
  notificationRoutes,
  reportRoutes,
  settingsRoutes,
  accountRoutes,
  guarantorRoutes,
  repaymentRoutes,
  chatRoutes,
  loanAssessmentRoutes,
  contributionRoutes,
} = require('./routes');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// CORS configuration - MUST be applied early, before routes
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Mount health routes (usually before protected routes)
app.use('/api/health', healthRoutes);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'], // Added PUT for general API, adjust as needed
    credentials: true,
  },
});

// Make io accessible in your Express controllers
app.set('io', io);

// Socket.IO Authentication Middleware (APPLIED ONCE BEFORE CONNECTION HANDLER)
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
    socket.user = user; // Attach user object to the socket
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO Connection Handling (THIS BLOCK SHOULD ONLY APPEAR ONCE)
io.on('connection', socket => {
  // console.log(`User connected: ${socket.id}`); // This is handled by the auth middleware's `next()`
  console.log(
    `User ${socket.user.name} (${socket.user.id}) connected via socket: ${socket.id}`
  );

  // Join a group chat
  socket.on('join-group', async data => {
    try {
      const { groupId } = data; // userId comes from socket.user.id
      // Ensure group ID is valid before access check
      if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        // Added mongoose for ObjectId check
        throw new Error('Invalid Group ID format provided for joining.');
      }

      await checkGroupAccess(groupId, socket.user.id, socket.user.role);
      socket.join(`group-${groupId}`); // Room name should be consistent, e.g., 'group-XYZ'
      console.log(`User ${socket.user.id} joined group room: group-${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
      socket.emit('socket-error', {
        // Use a generic 'socket-error' event for client-side display
        event: 'join-group',
        message: error.message || 'Failed to join group.',
      });
    }
  });

  // Leave a group chat
  socket.on('leave-group', data => {
    const { groupId } = data;
    // Room name should be consistent with how it was joined
    socket.leave(`group-${groupId}`);
    console.log(`User ${socket.user.id} left group room: group-${groupId}`);
  });

  // Handle chat messages
  socket.on('send-message', async data => {
    try {
      // Client needs to send: message (content), chatId, chatType, and optionally groupId
      const { message: content, chatId, chatType, groupId } = data;

      // Validate essential data
      if (!content || content.trim() === '' || !chatId || !chatType) {
        throw new Error(
          'Message content, chat ID, and chat type are required.'
        );
      }

      // Perform access control for real-time messages using socket.user
      if (chatType === 'group') {
        if (!groupId) {
          throw new Error('Group ID is required for group chats.');
        }
        await checkGroupAccess(groupId, socket.user.id, socket.user.role);
      } else if (chatType === 'admin') {
        if (chatId !== 'admin-chat') {
          throw new Error('Invalid chat ID for admin chat type.');
        }
        if (!['member', 'officer', 'admin'].includes(socket.user.role)) {
          throw new Error(
            'You are not authorized to send messages to admin support.'
          );
        }
      } else if (chatType === 'direct') {
        // TODO: Implement access check for direct messages (e.g., check if chatId contains current user's ID)
        // For now, let's allow it for demonstration, but this needs security.
        // Example:
        // const participantIds = chatId.split('_'); // Assuming chatId is like 'user1id_user2id'
        // if (!participantIds.includes(socket.user.id.toString())) {
        //    throw new Error('Not authorized to send direct message to this chat.');
        // }
      } else {
        throw new Error('Invalid chat type specified.');
      }

      // Use the extracted function to create and save the message
      const savedMessage = await createAndSaveChatMessage(
        socket.user.id, // Sender ID from authenticated socket
        content,
        chatType,
        chatId,
        groupId // groupId is optional in the model if chatType is not 'group'
      );

      // Broadcast to the specific chat room using the consistent chatId
      io.to(chatId).emit('new_message', {
        message: savedMessage.toJSON(), // Ensure populated sender and virtuals are included
        chatId,
        chatType,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('socket-error', {
        // Use a generic 'socket-error' event for client-side display
        event: 'send-message',
        message: error.message || 'Failed to send message',
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', data => {
    const { chatId, isTyping } = data; // Client should send chatId (e.g., 'group-XYZ' or 'admin-chat')
    // Emit to others in the room, excluding the sender
    socket.to(chatId).emit('user-typing', { userId: socket.user.id, isTyping });
  });

  socket.on('disconnect', reason => {
    console.log(
      `User ${socket.user?.name || socket.id} disconnected: ${reason}`
    );
    // You might want to emit an 'user_offline' event here if you track online status
  });

  // Add a generic error listener for debugging client-side emits without a listener
  socket.on('error', err => {
    console.error('Socket error (from client or internal):', err);
  });
});

// Security middleware (keep these in order)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection - temporarily disabled due to compatibility issues
// app.use(mongoSanitize());

// Data sanitization against XSS - temporarily disabled due to compatibility issues
// app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/guarantors', guarantorRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/loan-assessments', loanAssessmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contributions', contributionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Uncaught exceptions
process.on('uncaughtException', err => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Start server
    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`⚡ Socket.io enabled`);

      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔧 Development Mode: Default admin account available:`);
        console.log(`   Email: admin@microfinance.com`);
        console.log(`   Password: admin1234`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Export app for testing
module.exports = { app, server, io };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
