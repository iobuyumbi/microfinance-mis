// Express app configuration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');

// Import middleware
const { errorHandler, notFound } = require('../middleware');

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
} = require('../routes');

const memberRoutes = require('../routes/memberRoutes');
const healthRoutes = require('../routes/healthRoutes');

const createApp = () => {
  const app = express();

  // CORS configuration - MUST be applied early, before routes
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Rate limiting
  if (process.env.NODE_ENV === 'production') {
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
  }

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

  // Mount health routes
  app.use('/api/health', healthRoutes);

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/members', memberRoutes);
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

  return app;
};

module.exports = createApp;
