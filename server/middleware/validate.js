// Validation middleware for input validation
const { ErrorResponse } = require('../utils');
const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  // Check all parameters that might be ObjectIds
  const idParams = ['id', 'memberId', 'groupId', 'loanId', 'userId', 'accountId', 'transactionId', 'meetingId', 'notificationId', 'reportId', 'settingId', 'guarantorId', 'repaymentId', 'assessmentId', 'messageId', 'contributionId'];
  
  for (const param of idParams) {
    if (req.params[param] && !mongoose.Types.ObjectId.isValid(req.params[param])) {
      return next(new ErrorResponse(`Invalid ${param} format`, 400));
    }
  }
  next();
};

// Validate required fields
const validateRequiredFields = fields => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return next(
        new ErrorResponse(
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        )
      );
    }
    next();
  };
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return next(new ErrorResponse('Invalid pagination parameters', 400));
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };

  next();
};

module.exports = {
  validateObjectId,
  validateRequiredFields,
  validatePagination,
};
