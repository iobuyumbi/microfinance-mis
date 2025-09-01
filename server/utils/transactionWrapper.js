
const mongoose = require('mongoose');
const { createAuditLog } = require('../middleware/auditLogger');

/**
 * Execute operations within a MongoDB transaction
 */
const withTransaction = async (operations, options = {}) => {
  const session = await mongoose.startSession();
  
  try {
    let result;
    
    await session.withTransaction(async () => {
      result = await operations(session);
    }, {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
      ...options
    });
    
    return result;
  } finally {
    await session.endSession();
  }
};

/**
 * Financial operation wrapper with audit logging
 */
const executeFinancialOperation = async (operationData) => {
  const {
    operation,
    userId,
    resource,
    resourceId,
    req,
    metadata = {}
  } = operationData;

  return await withTransaction(async (session) => {
    // Execute the financial operation
    const result = await operation(session);
    
    // Log the operation
    if (userId && resource) {
      await createAuditLog({
        userId,
        action: metadata.action || 'UPDATE',
        resource,
        resourceId,
        changes: {
          before: metadata.before,
          after: result
        },
        req,
        metadata: {
          ...metadata,
          transactionId: session.id
        }
      });
    }
    
    return result;
  });
};

module.exports = {
  withTransaction,
  executeFinancialOperation
};
