/**
 * Centralized Response Handler
 * Provides consistent API responses across the application
 * Ensures consistent data structure and formatting
 */

const logger = require('./logger');

/**
 * Success response formatter
 */
class ResponseHandler {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {*} data - Response data
   * @param {Object} meta - Additional metadata
   */
  static success(
    res,
    statusCode = 200,
    message = 'Success',
    data = null,
    meta = {}
  ) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (data !== null) {
      response.data = data;
    }

    // Log successful response
    logger.info('API Response Success', {
      statusCode,
      message,
      url: res.req?.originalUrl,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {*} data - Created resource data
   * @param {Object} meta - Additional metadata
   */
  static created(
    res,
    message = 'Resource created successfully',
    data = null,
    meta = {}
  ) {
    return this.success(res, 201, message, data, meta);
  }

  /**
   * Send no content response
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    logger.info('API Response No Content', {
      url: res.req?.originalUrl,
      method: res.req?.method,
    });

    return res.status(204).send();
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Array} data - Array of data items
   * @param {Object} pagination - Pagination information
   * @param {Object} meta - Additional metadata
   */
  static paginated(
    res,
    message = 'Data retrieved successfully',
    data = [],
    pagination = {},
    meta = {}
  ) {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        pages: pagination.pages || 0,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
      },
      timestamp: new Date().toISOString(),
      ...meta,
    };

    logger.info('API Response Paginated', {
      message,
      pagination: response.pagination,
      url: res.req?.originalUrl,
      method: res.req?.method,
    });

    return res.status(200).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {*} error - Error details
   * @param {Object} meta - Additional metadata
   */
  static error(
    res,
    statusCode = 500,
    message = 'Internal Server Error',
    error = null,
    meta = {}
  ) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error;
    }

    // Log error response
    logger.error('API Response Error', {
      statusCode,
      message,
      error: error?.message || error,
      url: res.req?.originalUrl,
      method: res.req?.method,
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} errors - Validation errors
   */
  static validationError(res, message = 'Validation failed', errors = {}) {
    return this.error(res, 400, message, {
      type: 'ValidationError',
      details: errors,
    });
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Not found message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, 404, message, { type: 'NotFoundError' });
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, 401, message, { type: 'AuthenticationError' });
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Forbidden message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, 403, message, { type: 'AuthorizationError' });
  }

  /**
   * Send conflict response
   * @param {Object} res - Express response object
   * @param {string} message - Conflict message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(res, 409, message, { type: 'ConflictError' });
  }

  /**
   * Send financial error response
   * @param {Object} res - Express response object
   * @param {string} message - Financial error message
   * @param {*} details - Error details
   */
  static financialError(
    res,
    message = 'Financial operation failed',
    details = null
  ) {
    return this.error(res, 400, message, { type: 'FinancialError', details });
  }

  /**
   * Send rate limit response
   * @param {Object} res - Express response object
   * @param {string} message - Rate limit message
   */
  static rateLimit(res, message = 'Too many requests') {
    return this.error(res, 429, message, { type: 'RateLimitError' });
  }

  /**
   * Format financial data for response
   * @param {Object} data - Financial data to format
   * @param {string} currency - Currency code
   * @returns {Object} - Formatted financial data
   */
  static formatFinancialData(data, currency = 'KES') {
    if (!data) return data;

    const formatAmount = amount => {
      if (typeof amount !== 'number') return amount;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    const formatPercentage = rate => {
      if (typeof rate !== 'number') return rate;
      return `${rate.toFixed(2)}%`;
    };

    // Deep clone the data to avoid modifying the original
    const formattedData = JSON.parse(JSON.stringify(data));

    // Recursively format financial fields
    const formatFinancialFields = obj => {
      for (const [key, value] of Object.entries(obj)) {
        if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          formatFinancialFields(value);
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              formatFinancialFields(item);
            }
          });
        } else if (typeof value === 'number') {
          if (
            key.toLowerCase().includes('amount') ||
            key.toLowerCase().includes('balance')
          ) {
            obj[key] = formatAmount(value);
          } else if (
            key.toLowerCase().includes('rate') ||
            key.toLowerCase().includes('interest')
          ) {
            obj[key] = formatPercentage(value);
          }
        }
      }
    };

    formatFinancialFields(formattedData);
    return formattedData;
  }

  /**
   * Send financial data response with formatting
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Financial data
   * @param {string} currency - Currency code
   * @param {Object} meta - Additional metadata
   */
  static financialSuccess(
    res,
    message = 'Financial data retrieved successfully',
    data = null,
    currency = 'KES',
    meta = {}
  ) {
    const formattedData = this.formatFinancialData(data, currency);
    return this.success(res, 200, message, formattedData, meta);
  }
}

module.exports = ResponseHandler;
