/**
 * Client-side logger utility for consistent logging across the application
 * Provides different log levels and environment-aware logging
 */

// Log levels in order of severity
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Get current environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Default minimum log level based on environment
const DEFAULT_MIN_LEVEL = isProduction ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

// Logger configuration
let config = {
  minLevel: DEFAULT_MIN_LEVEL,
  enableConsole: true,
  enableRemote: isProduction, // Only send logs to server in production
  prefix: '',
};

/**
 * Configure the logger
 * @param {Object} options - Configuration options
 * @param {number} options.minLevel - Minimum log level to display
 * @param {boolean} options.enableConsole - Whether to log to console
 * @param {boolean} options.enableRemote - Whether to send logs to server
 * @param {string} options.prefix - Prefix for all log messages
 */
const configure = (options = {}) => {
  config = { ...config, ...options };
};

/**
 * Format a log message with metadata
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {Object} Formatted log object
 */
const formatLog = (level, message, data = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message: config.prefix ? `${config.prefix}: ${message}` : message,
    data,
  };
};

/**
 * Send log to remote server (for production monitoring)
 * @param {Object} logData - Formatted log data
 */
const sendRemoteLog = async (logData) => {
  if (!config.enableRemote) return;
  
  try {
    // This would typically send to a logging service or backend API
    // For now, we'll just simulate it
    if (isProduction) {
      // In a real implementation, you would send to your logging service
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logData) });
    }
  } catch (error) {
    // Silently fail - we don't want logging to crash the app
    console.error('Failed to send remote log:', error);
  }
};

/**
 * Log a message at the specified level
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
const log = (level, message, data = {}) => {
  // Skip if below minimum level
  if (LOG_LEVELS[level] < config.minLevel) return;
  
  const logData = formatLog(level, message, data);
  
  // Console logging
  if (config.enableConsole) {
    const consoleMethod = {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
    }[level] || 'log';
    
    console[consoleMethod](
      `[${logData.timestamp}] [${level}] ${logData.message}`,
      Object.keys(data).length ? data : ''
    );
  }
  
  // Remote logging
  sendRemoteLog(logData);
};

// Convenience methods for each log level
const debug = (message, data) => log('DEBUG', message, data);
const info = (message, data) => log('INFO', message, data);
const warn = (message, data) => log('WARN', message, data);
const error = (message, data) => log('ERROR', message, data);

// Export the logger
const logger = {
  configure,
  debug,
  info,
  warn,
  error,
  LOG_LEVELS,
};

export default logger;