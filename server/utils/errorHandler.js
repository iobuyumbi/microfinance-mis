/**
 * Centralized Error Handling System
 * Provides consistent error responses and proper logging
 * Ensures production-ready error handling
 */

const logger = require('./logger');

/**
 * Custom error classes for different types of errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, true);
    this.details = details;
    this.type = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true);
    this.type = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, true);
    this.type = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.type = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, true);
    this.type = 'ConflictError';
  }
}

class FinancialError extends AppError {
  constructor(message = 'Financial operation failed') {
    super(message, 400, true);
    this.type = 'FinancialError';
  }
}

/**
 * Error response formatter
 */
const formatErrorResponse = (error, req) => {
  const baseResponse = {
    success: false,
    error: {
      type: error.type || 'AppError',
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req?.originalUrl || 'unknown',
      method: req?.method || 'unknown',
    },
  };

  // Add validation details if available
  if (error.details) {
    baseResponse.error.details = error.details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    baseResponse.error.stack = error.stack;
  }

  return baseResponse;
};

/**
 * Central error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Log error with appropriate level
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    logger.warn('Client Error:', {
      error: error.message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' && error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Format error response
  const errorResponse = formatErrorResponse(
    { ...error, statusCode, message },
    req
  );

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for controllers
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes
 */
const notFound = (req, res) => {
  const error = new NotFoundError('Route');
  const errorResponse = formatErrorResponse(error, req);

  res.status(404).json(errorResponse);
};

/**
 * Global unhandled rejection handler
 */
const handleUnhandledRejection = (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);

  // Close server gracefully
  process.exit(1);
};

/**
 * Global uncaught exception handler
 */
const handleUncaughtException = error => {
  logger.error('Uncaught Exception:', error);

  // Close server gracefully
  process.exit(1);
};

/**
 * Setup global error handlers
 */
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  FinancialError,
  errorHandler,
  asyncHandler,
  notFound,
  setupGlobalErrorHandlers,
};
