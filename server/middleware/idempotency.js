
const mongoose = require('mongoose');

// Idempotency key storage (in production, use Redis)
const idempotencyStore = new Map();

const idempotencySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  response: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours
  }
});

const IdempotencyRecord = mongoose.model('IdempotencyRecord', idempotencySchema);

/**
 * Idempotency middleware for preventing duplicate operations
 */
const idempotency = (options = {}) => {
  const { 
    headerName = 'Idempotency-Key',
    ttl = 86400000 // 24 hours in milliseconds
  } = options;

  return async (req, res, next) => {
    const idempotencyKey = req.headers[headerName.toLowerCase()];
    
    // Skip if no idempotency key provided
    if (!idempotencyKey) {
      return next();
    }

    try {
      // Check if we've seen this key before
      const existingRecord = await IdempotencyRecord.findOne({ key: idempotencyKey });
      
      if (existingRecord) {
        // Return cached response
        return res.status(200).json(existingRecord.response);
      }

      // Store original send method
      const originalSend = res.send;
      const originalJson = res.json;
      
      let responseData = null;
      let statusCode = 200;

      // Override response methods to capture data
      res.send = function(data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalSend.call(this, data);
      };

      res.json = function(data) {
        responseData = data;
        statusCode = this.statusCode;
        return originalJson.call(this, data);
      };

      // Continue to next middleware
      next();

      // Store response after successful completion
      res.on('finish', async () => {
        if (statusCode >= 200 && statusCode < 300 && responseData) {
          try {
            await IdempotencyRecord.create({
              key: idempotencyKey,
              response: responseData
            });
          } catch (error) {
            console.error('Failed to store idempotency record:', error);
          }
        }
      });

    } catch (error) {
      console.error('Idempotency middleware error:', error);
      next();
    }
  };
};

module.exports = { idempotency, IdempotencyRecord };
