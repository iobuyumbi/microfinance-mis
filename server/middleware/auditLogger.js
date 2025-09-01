
const AuditLog = require('../models/AuditLog');

/**
 * Create audit log entry
 */
const createAuditLog = async (options) => {
  try {
    const {
      userId,
      action,
      resource,
      resourceId,
      changes,
      req,
      metadata = {}
    } = options;

    const auditEntry = new AuditLog({
      userId,
      action,
      resource,
      resourceId,
      changes,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent'),
      metadata
    });

    await auditEntry.save();
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Audit logging failed:', error);
  }
};

/**
 * Middleware to automatically log certain actions
 */
const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override send method to capture response
    res.send = function(data) {
      res.auditData = data;
      return originalSend.call(this, data);
    };

    res.json = function(data) {
      res.auditData = data;
      return originalJson.call(this, data);
    };

    // Continue to next middleware
    next();

    // Log after response is sent (if successful)
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await createAuditLog({
            userId: req.user?._id,
            action,
            resource,
            resourceId: req.params.id || res.auditData?.data?._id,
            changes: {
              before: req.originalData,
              after: res.auditData?.data
            },
            req,
            metadata: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode
            }
          });
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      }
    });
  };
};

module.exports = {
  createAuditLog,
  auditLogger
};
