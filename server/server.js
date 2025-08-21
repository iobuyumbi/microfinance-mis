// Microfinance MIS - Main Server Entry

// Load environment variables first
require('dotenv').config();

// Core dependencies
const express = require('express');
const http = require('http');
const path = require('path');

// Security and middleware
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');

// Socket.IO and authentication
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Added mongoose to validate ObjectId

// Models
const User = require('./models/User');

// Configuration
const { connectDB, validateEnv } = require('./config');
const configureSocket = require('./config/socket');

// Middleware
const { errorHandler, notFound } = require('./middleware');

// Controllers
const {
  checkGroupAccess,
  createAndSaveChatMessage,
} = require('./controllers/chatController');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const memberRoutes = require('./routes/memberRoutes');
const groupMembershipRoutes = require('./routes/groupMembershipRoutes');
const loanRoutes = require('./routes/loanRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const accountRoutes = require('./routes/accountRoutes');
const guarantorRoutes = require('./routes/guarantorRoutes');
const repaymentRoutes = require('./routes/repaymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const loanAssessmentRoutes = require('./routes/loanAssessmentRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// CORS configuration - MUST be applied early, before routes
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Mount health routes (usually before protected routes)
app.use('/api/health', healthRoutes);

// Root route for basic server info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Microfinance MIS Backend Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      api: '/api',
      documentation: '/api-docs',
    },
  });
});

// API documentation route
app.get('/api-docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Documentation',
    version: '1.0.0',
    baseUrl: '/api',
    endpoints: {
      auth: {
        description: 'Authentication endpoints',
        routes: [
          'POST /api/auth/register - User registration',
          'POST /api/auth/login - User login',
          'GET /api/auth/me - Get current user',
          'POST /api/auth/forgot-password - Forgot password',
          'POST /api/auth/reset-password - Reset password',
        ],
      },
      users: {
        description: 'User management',
        routes: [
          'GET /api/users - Get all users',
          'POST /api/users - Create user',
          'GET /api/users/:id - Get user by ID',
          'PUT /api/users/:id - Update user',
          'DELETE /api/users/:id - Delete user',
        ],
      },
      groups: {
        description: 'Group management',
        routes: [
          'GET /api/groups - Get all groups',
          'POST /api/groups - Create group',
          'GET /api/groups/:id - Get group by ID',
          'PUT /api/groups/:id - Update group',
          'DELETE /api/groups/:id - Delete group',
        ],
      },
      contributions: {
        description: 'Contribution tracking',
        routes: [
          'GET /api/contributions - Get all contributions',
          'POST /api/contributions - Create contribution',
          'GET /api/contributions/groups/:groupId - Get group contributions',
          'GET /api/contributions/groups/:groupId/summary - Get group summary',
          'GET /api/contributions/groups/:groupId/export - Export contributions',
        ],
      },
      loans: {
        description: 'Loan management',
        routes: [
          'GET /api/loans - Get all loans',
          'POST /api/loans - Create loan',
          'PUT /api/loans/:id - Update loan',
          'DELETE /api/loans/:id - Delete loan',
        ],
      },
      chat: {
        description: 'Real-time chat',
        routes: [
          'GET /api/chat/channels - Get chat channels',
          'GET /api/chat/messages - Get messages',
          'POST /api/chat/messages - Send message',
        ],
      },
    },
    socketEvents: {
      'join-group': 'Join a group chat room',
      'leave-group': 'Leave a group chat room',
      'send-message': 'Send a chat message',
      new_message: 'Receive new message',
      'socket-error': 'Socket error notification',
    },
  });
});

// Additional utility routes
app.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Microfinance MIS Backend',
    description: 'A comprehensive microfinance management information system',
    version: process.env.npm_package_version || '1.0.0',
    author: 'Development Team',
    license: 'MIT',
    repository: 'https://github.com/iobuyumbi/microfinance-mis',
    endpoints: {
      root: '/',
      health: '/api/health',
      status: '/status',
      info: '/info',
      api: '/api',
      docs: '/api-docs',
    },
  });
});

// Initialize Socket.IO using modularized config
const io = configureSocket(server);
app.set('io', io);

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
app.use('/api', limiter);

// -------------------------------------------------------------
// IMPORTANT: MOVE THE BODY PARSING MIDDLEWARE HERE
// It needs to be placed BEFORE any of your API routes are defined
// -------------------------------------------------------------
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
console.log('🔧 Registering API routes...');
try {
  app.use('/api/auth', authRoutes);
  console.log('  ✅ /api/auth registered');
} catch (error) {
  console.log('  ❌ Error registering /api/auth:', error.message);
}

try {
  app.use('/api/users', userRoutes);
  console.log('  ✅ /api/users registered');
} catch (error) {
  console.log('  ❌ Error registering /api/users:', error.message);
}

try {
  app.use('/api/groups', groupRoutes);
  console.log('  ✅ /api/groups registered');
} catch (error) {
  console.log('  ❌ Error registering /api/groups:', error.message);
}

try {
  app.use('/api/members', memberRoutes);
  console.log('  ✅ /api/members registered');
} catch (error) {
  console.log('  ❌ Error registering /api/members:', error.message);
}

try {
  app.use('/api/members', groupMembershipRoutes);
  console.log('  ✅ /api/members (groupMembership) registered');
} catch (error) {
  console.log(
    '  ❌ Error registering /api/members (groupMembership):',
    error.message
  );
}

try {
  app.use('/api/loans', loanRoutes);
  console.log('  ✅ /api/loans registered');
} catch (error) {
  console.log('  ❌ Error registering /api/loans:', error.message);
}

try {
  app.use('/api/savings', savingsRoutes);
  console.log('  ✅ /api/savings registered');
} catch (error) {
  console.log('  ❌ Error registering /api/savings:', error.message);
}

try {
  app.use('/api/transactions', transactionRoutes);
  console.log('  ✅ /api/transactions registered');
} catch (error) {
  console.log('  ❌ Error registering /api/transactions:', error.message);
}

try {
  app.use('/api/meetings', meetingRoutes);
  console.log('  ✅ /api/meetings registered');
} catch (error) {
  console.log('  ❌ Error registering /api/meetings:', error.message);
}

try {
  app.use('/api/notifications', notificationRoutes);
  console.log('  ✅ /api/notifications registered');
} catch (error) {
  console.log('  ❌ Error registering /api/notifications:', error.message);
}

try {
  app.use('/api/reports', reportRoutes);
  console.log('  ✅ /api/reports registered');
} catch (error) {
  console.log('  ❌ Error registering /api/reports:', error.message);
}

try {
  app.use('/api/settings', settingsRoutes);
  console.log('  ✅ /api/settings registered');
} catch (error) {
  console.log('  ❌ Error registering /api/settings:', error.message);
}

try {
  app.use('/api/accounts', accountRoutes);
  console.log('  ✅ /api/accounts registered');
} catch (error) {
  console.log('  ❌ Error registering /api/accounts:', error.message);
}

try {
  app.use('/api/guarantors', guarantorRoutes);
  console.log('  ✅ /api/guarantors registered');
} catch (error) {
  console.log('  ❌ Error registering /api/guarantors:', error.message);
}

try {
  app.use('/api/repayments', repaymentRoutes);
  console.log('  ✅ /api/repayments registered');
} catch (error) {
  console.log('  ❌ Error registering /api/repayments:', error.message);
}

try {
  app.use('/api/loan-assessments', loanAssessmentRoutes);
  console.log('  ✅ /api/loan-assessments registered');
} catch (error) {
  console.log('  ❌ Error registering /api/loan-assessments:', error.message);
}

try {
  app.use('/api/chat', chatRoutes);
  console.log('  ✅ /api/chat registered');
} catch (error) {
  console.log('  ❌ Error registering /api/chat:', error.message);
}

try {
  // Re-enabled after fixing path-to-regexp error
  app.use('/api/contributions', contributionRoutes);
  console.log('  ✅ /api/contributions registered');
} catch (error) {
  console.log('  ❌ Error registering /api/contributions:', error.message);
}

// Debug: Log all registered routes
console.log('🔍 Registered API routes:');
// Simplified route logging to avoid path-to-regexp error
try {
  app._router?.stack?.forEach((r, i) => {
    if (r.route && r.route.path) {
      console.log(
        `  ${i}: ${Object.keys(r.route.methods).join('|').toUpperCase()} ${r.route.path}`
      );
    } else if (r.regexp && r.name) {
      console.log(`  ${i}: Middleware: ${r.name}`);
    }
  });
} catch (error) {
  console.log('⚠️ Error logging routes:', error.message);
}

// Catch-all route for undefined paths (must be before error handling)
app.use(/(.*)/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
    availableRoutes: {
      root: '/',
      health: '/health',
      status: '/status',
      info: '/info',
      apiHealth: '/api/health',
      apiDocs: '/api-docs',
      api: '/api/(.*)',
    },
    timestamp: new Date().toISOString(),
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

process.on('uncaughtException', err => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Validate env in production
    if (process.env.NODE_ENV === 'production') {
      validateEnv();
    }
    // Connect to database
    await connectDB();
    console.log('✅ MongoDB connected successfully'); // Start server

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`⚡ Socket.io enabled`);

      if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔧 Development Mode: Default admin account available:`);
        console.log(`   Email: admin@microfinance.com`);
        console.log(`   Password: admin1234`);
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
