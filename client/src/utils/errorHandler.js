/**
 * Comprehensive Error Handling Utility
 * Provides user-friendly error messages and consistent error handling
 */

import { toast } from "sonner";

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  // Validation errors
  VALIDATION: {
    default: "Please check your input and try again",
    required: "This field is required",
    email: "Please enter a valid email address",
    password: "Password must be at least 8 characters long",
    amount: "Please enter a valid amount",
    date: "Please enter a valid date",
    phone: "Please enter a valid phone number",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be no more than {max} characters",
    minValue: "Value must be at least {min}",
    maxValue: "Value cannot exceed {max}",
    insufficient_funds: "Insufficient funds for this transaction",
    duplicate: "This record already exists"
  },

  // Network errors
  NETWORK: {
    default: "Network connection error. Please check your internet connection",
    timeout: "Request timed out. Please try again",
    offline: "You appear to be offline. Please check your connection",
    server_unreachable: "Unable to reach the server. Please try again later"
  },

  // Authentication errors
  AUTHENTICATION: {
    default: "Authentication failed. Please log in again",
    invalid_credentials: "Invalid email or password",
    session_expired: "Your session has expired. Please log in again",
    token_invalid: "Authentication token is invalid",
    token_expired: "Authentication token has expired"
  },

  // Authorization errors
  AUTHORIZATION: {
    default: "You don't have permission to perform this action",
    insufficient_permissions: "You don't have the required permissions",
    role_required: "This action requires specific user role",
    access_denied: "Access denied to this resource"
  },

  // Not found errors
  NOT_FOUND: {
    default: "The requested resource was not found",
    user: "User not found",
    group: "Group not found",
    loan: "Loan not found",
    transaction: "Transaction not found",
    meeting: "Meeting not found",
    member: "Member not found"
  },

  // Server errors
  SERVER: {
    default: "Server error occurred. Please try again later",
    internal: "Internal server error. Please contact support",
    database: "Database error occurred. Please try again",
    maintenance: "System is under maintenance. Please try again later"
  },

  // Unknown errors
  UNKNOWN: {
    default: "An unexpected error occurred. Please try again"
  }
};

/**
 * Extract error type from error message or response
 */
export const getErrorType = (error) => {
  const message = error?.message || error?.response?.data?.message || '';
  const status = error?.response?.status;

  // Check for specific error patterns
  if (message.includes('VALIDATION_ERROR')) return ErrorTypes.VALIDATION;
  if (message.includes('INSUFFICIENT_FUNDS')) return ErrorTypes.VALIDATION;
  if (message.includes('DUPLICATE')) return ErrorTypes.VALIDATION;
  
  // Check HTTP status codes
  if (status === 400) return ErrorTypes.VALIDATION;
  if (status === 401) return ErrorTypes.AUTHENTICATION;
  if (status === 403) return ErrorTypes.AUTHORIZATION;
  if (status === 404) return ErrorTypes.NOT_FOUND;
  if (status >= 500) return ErrorTypes.SERVER;
  
  // Check for network errors
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNABORTED') {
    return ErrorTypes.NETWORK;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error, context = 'default') => {
  const errorType = getErrorType(error);
  const message = error?.message || error?.response?.data?.message || '';
  
  // Try to extract specific error from message
  const specificError = Object.keys(ERROR_MESSAGES[errorType]).find(key => 
    message.toLowerCase().includes(key.toLowerCase())
  );
  
  if (specificError && specificError !== 'default') {
    return ERROR_MESSAGES[errorType][specificError];
  }
  
  // Check if there's a context-specific message
  if (ERROR_MESSAGES[errorType][context]) {
    return ERROR_MESSAGES[errorType][context];
  }
  
  // Return default message for error type
  return ERROR_MESSAGES[errorType].default;
};

/**
 * Format error message with parameters
 */
export const formatErrorMessage = (message, params = {}) => {
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] || match;
  });
};

/**
 * Show error toast with appropriate styling
 */
export const showErrorToast = (error, context = 'default') => {
  const errorType = getErrorType(error);
  const message = getErrorMessage(error, context);
  
  toast.error(message, {
    description: errorType === ErrorTypes.VALIDATION 
      ? "Please check your input and try again"
      : "Please try again or contact support if the problem persists",
    duration: errorType === ErrorTypes.VALIDATION ? 4000 : 6000,
  });
};

/**
 * Show success toast
 */
export const showSuccessToast = (message, description = null) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

/**
 * Show warning toast
 */
export const showWarningToast = (message, description = null) => {
  toast.warning(message, {
    description,
    duration: 4000,
  });
};

/**
 * Show info toast
 */
export const showInfoToast = (message, description = null) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

/**
 * Handle API errors with consistent logging and user feedback
 */
export const handleApiError = (error, context = 'default', options = {}) => {
  const {
    showToast = true,
    logError = true,
    rethrow = false
  } = options;

  // Log error for debugging
  if (logError) {
    console.error(`API Error in ${context}:`, {
      error,
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
      url: error?.config?.url,
      method: error?.config?.method
    });
  }

  // Show user-friendly error message
  if (showToast) {
    showErrorToast(error, context);
  }

  // Re-throw error if requested
  if (rethrow) {
    throw error;
  }

  return {
    error,
    type: getErrorType(error),
    message: getErrorMessage(error, context),
    handled: true
  };
};

/**
 * Validate form data and return user-friendly errors
 */
export const validateFormData = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];

    // Required validation
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = ERROR_MESSAGES.VALIDATION.required;
      return;
    }

    // Skip other validations if value is empty and not required
    if (!value && !fieldRules.required) return;

    // Email validation
    if (fieldRules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field] = ERROR_MESSAGES.VALIDATION.email;
        return;
      }
    }

    // Min length validation
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] = formatErrorMessage(ERROR_MESSAGES.VALIDATION.minLength, {
        min: fieldRules.minLength
      });
      return;
    }

    // Max length validation
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] = formatErrorMessage(ERROR_MESSAGES.VALIDATION.maxLength, {
        max: fieldRules.maxLength
      });
      return;
    }

    // Min value validation
    if (fieldRules.minValue !== undefined && value && Number(value) < fieldRules.minValue) {
      errors[field] = formatErrorMessage(ERROR_MESSAGES.VALIDATION.minValue, {
        min: fieldRules.minValue
      });
      return;
    }

    // Max value validation
    if (fieldRules.maxValue !== undefined && value && Number(value) > fieldRules.maxValue) {
      errors[field] = formatErrorMessage(ERROR_MESSAGES.VALIDATION.maxValue, {
        max: fieldRules.maxValue
      });
      return;
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, data);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  ErrorTypes,
  getErrorType,
  getErrorMessage,
  formatErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  handleApiError,
  validateFormData,
  retryWithBackoff
}; 