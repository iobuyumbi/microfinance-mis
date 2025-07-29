// Microfinance MIS - Main Server Entry

require('dotenv').config(); // Load env vars first

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const setupDatabase = require('./scripts/setupDatabase');

// Import all middleware from middleware/index.js
const { errorHandler, notFound } = require('./middleware');
// Import all routes from routes/index.js
const routes = require('./routes');

// Connect to MongoDB and setup database
async function initializeServer() {
  try {
    await connectDB();
    await setupDatabase();
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

initializeServer();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'https://microfinance-mis.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Core middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Route definitions: [path, routeModule]
const routeList = [
  ['/api/auth', routes.authRoutes],
  ['/api/users', routes.userRoutes],
  ['/api/groups', routes.groupRoutes],
  ['/api/loans', routes.loanRoutes],
  ['/api/repayments', routes.repaymentRoutes],
  ['/api/meetings', routes.meetingRoutes],
  ['/api/reports', routes.reportRoutes],
  ['/api/notifications', routes.notificationRoutes],
  ['/api/savings', routes.savingsRoutes],
  ['/api/transactions', routes.transactionRoutes],
  ['/api/accounts', routes.accountRoutes],
  ['/api/account-history', routes.accountHistoryRoutes],
  ['/api/guarantors', routes.guarantorRoutes],
  ['/api/settings', routes.settingsRoutes],
  ['/api/loan-assessments', routes.loanAssessmentRoutes],
  ['/api/chat', routes.chatRoutes],
  ['/api/contributions', routes.contributionRoutes],
];

// Mount all routes
routeList.forEach(([path, handler]) => app.use(path, handler));

// // Serve static files from the frontend build (adjust path as needed)
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../client/dist')));

// // Catch-all: send index.html for any other route (except API)
// app.get(/^\/(?!api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
// });

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Microfinance MIS API is running.',
    version: '1.0.0',
    endpoints: Object.fromEntries(
      routeList.map(([path]) => [path.replace('/api/', ''), path])
    ),
    documentation: 'API documentation coming soon...',
  });
});

// Use notFound middleware for 404s
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', socket => {
  console.log(`👤 User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', async token => {
    try {
      // Verify JWT token here if needed
      console.log(`🔐 User authenticated: ${socket.id}`);
      socket.authenticated = true;
      socket.userId = token.userId; // Store user ID for later use
    } catch (error) {
      console.error('Socket authentication failed:', error);
    }
  });

  // Join user to their personal room
  socket.on('join_room', data => {
    socket.join(data.room);
    console.log(`🏠 User ${socket.id} joined room: ${data.room}`);

    // Notify others in the room
    socket.to(data.room).emit('user_joined', {
      userId: socket.userId,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave room
  socket.on('leave_room', data => {
    socket.leave(data.room);
    console.log(`🚪 User ${socket.id} left room: ${data.room}`);

    // Notify others in the room
    socket.to(data.room).emit('user_left', {
      userId: socket.userId,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle real-time notifications
  socket.on('send_notification', data => {
    io.emit('notification', {
      id: Date.now(),
      message: data.message,
      type: data.type || 'info',
      timestamp: new Date().toISOString(),
    });
  });

  // Handle typing indicators
  socket.on('typing_start', data => {
    socket.to(data.room).emit('user_typing', {
      userId: socket.userId,
      typing: true,
      room: data.room,
    });
  });

  socket.on('typing_stop', data => {
    socket.to(data.room).emit('user_typing', {
      userId: socket.userId,
      typing: false,
      room: data.room,
    });
  });

  // Handle user status updates
  socket.on('status_update', data => {
    socket.broadcast.emit('user_status_change', {
      userId: socket.userId,
      status: data.status,
    });
  });

  // Handle chat messages (real-time)
  socket.on('send_message', async data => {
    try {
      // Broadcast message to room
      io.to(data.chatId).emit('new_message', {
        ...data,
        timestamp: new Date().toISOString(),
        socketId: socket.id,
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle message reactions
  socket.on('message_reaction', data => {
    socket.to(data.chatId).emit('message_reaction_update', {
      messageId: data.messageId,
      reaction: data.reaction,
      userId: socket.userId,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
    socket.broadcast.emit('user_offline', {
      userId: socket.userId,
      socketId: socket.id,
    });
  });
});

// Make io available to routes
app.set('io', io);

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // In production, show the actual host if available
  const host = process.env.HOST || 'localhost';
  console.log(`🔗 API Base URL: http://${host}:${PORT}/api`);
  console.log(`⚡ Socket.io enabled`);
});

module.exports = app;
