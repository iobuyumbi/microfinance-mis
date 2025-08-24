// Microfinance MIS - Main Server Entry
require('dotenv').config();

// Core dependencies
const express = require('express');
const http = require('http');
const path = require('path');

// Security and middleware
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Socket.IO and authentication
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Configuration
const { connectDB, validateEnv } = require('./config');
const configureSocket = require('./config/socket');

// Middleware
const {
  errorHandler,
  notFound,
  setupGlobalErrorHandlers,
} = require('./middleware/errorHandler');
const logger = require('./utils/logger');

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

// CORS configuration
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
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(logger.logRequest);

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

// Root route for basic server info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Microfinance MIS Backend Server',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
    },
  });
});

// API routes
const apiRoutes = [
  { path: '/api/auth', routes: authRoutes },
  { path: '/api/users', routes: userRoutes },
  { path: '/api/groups', routes: groupRoutes },
  { path: '/api/members', routes: memberRoutes },
  { path: '/api/members', routes: groupMembershipRoutes },
  { path: '/api/loans', routes: loanRoutes },
  { path: '/api/savings', routes: savingsRoutes },
  { path: '/api/transactions', routes: transactionRoutes },
  { path: '/api/meetings', routes: meetingRoutes },
  { path: '/api/notifications', routes: notificationRoutes },
  { path: '/api/reports', routes: reportRoutes },
  { path: '/api/settings', routes: settingsRoutes },
  { path: '/api/accounts', routes: accountRoutes },
  { path: '/api/guarantors', routes: guarantorRoutes },
  { path: '/api/repayments', routes: repaymentRoutes },
  { path: '/api/loan-assessments', routes: loanAssessmentRoutes },
  { path: '/api/chat', routes: chatRoutes },
  { path: '/api/contributions', routes: contributionRoutes },
  { path: '/api/health', routes: healthRoutes },
];

// Register API routes
apiRoutes.forEach(({ path: routePath, routes }) => {
  try {
    app.use(routePath, routes);
    logger.info(`✅ Route registered: ${routePath}`);
  } catch (error) {
    logger.error(`❌ Error registering route ${routePath}:`, error.message);
  }
});

// Initialize Socket.IO
const io = configureSocket(server);
app.set('io', io);

// Catch-all route for undefined paths
app.use('*', notFound);

// Error handling middleware
app.use(errorHandler);

// Setup global error handlers
setupGlobalErrorHandlers();

// Graceful shutdown handling
const gracefulShutdown = async signal => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    await server.close();
    logger.info('HTTP server closed');

    // Close database connection
    const { closeConnection } = require('./config/db');
    await closeConnection();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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
    logger.info('✅ MongoDB connected successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(
        `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
      logger.info(`⚡ Socket.io enabled`);

      if (process.env.NODE_ENV === 'development') {
        logger.info(`\n🔧 Development Mode: Default admin account available:`);
        logger.info(`   Email: admin@microfinance.com`);
        logger.info(`   Password: admin1234`);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Export app for testing
module.exports = { app, server, io };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
