// server\middleware\index.js
// Middleware index file - exports all middleware functions

const auth = require('./auth');
const {
  errorHandler,
  asyncHandler,
  notFound,
  setupGlobalErrorHandlers,
} = require('./errorHandler');
const validate = require('./validate');

module.exports = {
  auth,
  errorHandler,
  asyncHandler,
  notFound,
  validate,
  setupGlobalErrorHandlers,
};
