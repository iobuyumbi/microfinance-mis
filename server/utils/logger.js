/**
 * Production-Ready Logger Utility
 * Provides structured logging with different levels and formats
 * Supports both development and production environments
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define different log formats
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format:
      process.env.NODE_ENV === 'production' ? productionFormat : logFormat,
  }),
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: productionFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: productionFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: message => logger.http(message.trim()),
};

// Add request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Add financial transaction logging
logger.logFinancialTransaction = (transactionData, result) => {
  const logData = {
    type: transactionData.type,
    amount: transactionData.amount,
    accountId: transactionData.accountId,
    memberId: transactionData.memberId,
    groupId: transactionData.groupId,
    result: result.success ? 'success' : 'failed',
    timestamp: new Date().toISOString(),
  };

  if (result.success) {
    logger.info('Financial Transaction Success', logData);
  } else {
    logger.error('Financial Transaction Failed', logData);
  }
};

// Add user activity logging
logger.logUserActivity = (userId, action, details = {}) => {
  const logData = {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
  };

  logger.info('User Activity', logData);
};

// Add security event logging
logger.logSecurityEvent = (event, details = {}) => {
  const logData = {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent,
  };

  logger.warn('Security Event', logData);
};

// Add performance logging
logger.logPerformance = (operation, duration, details = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  };

  if (duration > 1000) {
    logger.warn('Performance Warning', logData);
  } else {
    logger.debug('Performance Metric', logData);
  }
};

// Export the logger
module.exports = logger;
