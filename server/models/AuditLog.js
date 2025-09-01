
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE',
      'UPDATE', 
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'LOAN_APPROVE',
      'LOAN_REJECT',
      'LOAN_DISBURSE',
      'REPAYMENT_RECORD',
      'SAVINGS_DEPOSIT',
      'SAVINGS_WITHDRAW'
    ]
  },
  resource: {
    type: String,
    required: true // e.g., 'loan', 'user', 'transaction'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: mongoose.Schema.Types.Mixed
});

// Index for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
