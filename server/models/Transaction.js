const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'savings_contribution',
        'savings_withdrawal',
        'loan_disbursement',
        'loan_repayment',
        'interest_payment',
        'penalty_payment',
        'fee_payment',
        'transfer',
        'refund',
      ],
      required: true,
    },
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
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'completed',
    },
    // Reference to related entities
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
    },
    savingsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Savings',
    },
    // For tracking running balance
    balanceAfter: {
      type: Number,
      required: true,
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
    // For audit trail
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate receipt number
transactionSchema.pre('save', async function (next) {
  if (this.isNew && !this.receiptNumber) {
    const count = await this.constructor.countDocuments();
    this.receiptNumber = `TXN-${Date.now()}-${count + 1}`;
  }
  next();
});

// Index for efficient querying
transactionSchema.index({ member: 1, createdAt: -1 });
transactionSchema.index({ group: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(this.amount);
});

// Virtual for transaction type label
transactionSchema.virtual('typeLabel').get(function () {
  const labels = {
    savings_contribution: 'Savings Contribution',
    savings_withdrawal: 'Savings Withdrawal',
    loan_disbursement: 'Loan Disbursement',
    loan_repayment: 'Loan Repayment',
    interest_payment: 'Interest Payment',
    penalty_payment: 'Penalty Payment',
    fee_payment: 'Fee Payment',
    transfer: 'Transfer',
    refund: 'Refund',
  };
  return labels[this.type] || this.type;
});

// Ensure virtuals are serialized
transactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
