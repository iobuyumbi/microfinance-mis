// ErrorResponse utility class for consistent error handling
// Now extends from the new comprehensive error handling system
const { AppError } = require('./errorHandler');

class ErrorResponse extends AppError {
  constructor(message, statusCode) {
    super(message, statusCode);
    // Maintain backward compatibility
    this.name = 'ErrorResponse';
  }
}

module.exports = ErrorResponse;
