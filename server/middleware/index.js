// server\middleware\index.js
// Middleware index file - exports all middleware functions

const auth = require('./auth');
const errorHandler = require('./errorHandler');
const asyncHandler = require('./asyncHandler');
const notFound = require('./notFound');
const validate = require('./validate');

module.exports = {
  auth,
  errorHandler,
  asyncHandler,
  notFound,
  validate,
};
