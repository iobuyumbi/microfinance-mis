// Middleware index file - exports all middleware functions

const { protect, authorize, optionalAuth } = require("./auth");
const {
  validateObjectId,
  validatePagination,
  validateRequiredFields,
} = require("./validate");
const asyncHandler = require("./asyncHandler");
const errorHandler = require("./errorHandler");

module.exports = {
  // Auth middleware
  protect,
  authorize,
  optionalAuth,

  // Validation middleware
  validateObjectId,
  validatePagination,
  validateRequiredFields,

  // Utility middleware
  asyncHandler,

  // Error handling
  errorHandler,
};
