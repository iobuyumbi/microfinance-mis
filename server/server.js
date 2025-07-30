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

// Import controllers for Socket.IO
const { chatController } = require('./controllers');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Security middleware
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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

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

// Socket.IO connection handling
io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // Join a group chat
  socket.on('join-group', async data => {
    try {
      const { groupId, userId } = data;
      socket.join(`group-${groupId}`);
      console.log(`User ${userId} joined group ${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  });

  // Leave a group chat
  socket.on('leave-group', data => {
    const { groupId } = data;
    socket.leave(`group-${groupId}`);
    console.log(`User left group ${groupId}`);
  });

  // Handle chat messages
  socket.on('send-message', async data => {
    try {
      const { groupId, message, userId } = data;

      // Save message to database
      const savedMessage = await chatController.createMessage({
        groupId,
        sender: userId,
        content: message,
        chatType: 'group',
      });

      // Broadcast to group
      io.to(`group-${groupId}`).emit('new-message', {
        ...savedMessage.toObject(),
        sender: {
          _id: savedMessage.sender,
          name: savedMessage.senderName,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', data => {
    const { groupId, userId, isTyping } = data;
    socket.to(`group-${groupId}`).emit('user-typing', { userId, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

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
