// server\middleware\index.js
// Middleware index file - exports all middleware functions

const {
  protect,
  authorize,
  optionalAuth,
  authorizeGroupPermission, // New
  authorizeGroupAccess, // New
  authorizeOwnerOrAdmin, // New
  filterDataByRole, // New
  // getDefaultPermissions is internal to auth.js, no need to export here
} = require('./auth');
const {
  validateObjectId,
  validatePagination,
  validateRequiredFields,
} = require('./validate');
const asyncHandler = require('./asyncHandler');
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');

module.exports = {
  // Auth & Authorization middleware
  protect,
  authorize,
  optionalAuth,
  authorizeGroupPermission,
  authorizeGroupAccess,
  authorizeOwnerOrAdmin,
  filterDataByRole, // Consider if this is truly 'middleware' or a 'utility', but fine here for now.

  // Validation middleware
  validateObjectId,
  validatePagination,
  validateRequiredFields,

  // Utility middleware
  asyncHandler,

  // Error handling
  errorHandler,
  notFound,
};
