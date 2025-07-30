// 404 Not Found middleware
const { ErrorResponse } = require('../utils');

const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = notFound;
