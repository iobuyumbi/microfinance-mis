const mongoose = require('mongoose');

const savingsSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['contribution', 'withdrawal', 'interest', 'penalty'],
      default: 'contribution',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    method: {
      type: String,
      enum: ['cash', 'mobile', 'bank', 'cheque'],
      default: 'cash',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    // For tracking running balance
    balanceAfter: {
      type: Number,
      required: true,
    },
    // Reference to transaction
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    // For approval workflow
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    // For receipts
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate receipt number
savingsSchema.pre('save', async function (next) {
  if (this.isNew && !this.receiptNumber) {
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `SAV-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for efficient querying
savingsSchema.index({ member: 1, createdAt: -1 });
savingsSchema.index({ group: 1, createdAt: -1 });
savingsSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
savingsSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(this.amount);
});

// Ensure virtuals are serialized
savingsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Savings', savingsSchema);
