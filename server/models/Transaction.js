// server\models\Transaction.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('../utils/currencyUtils');

// REMOVE THE OLD getCurrency FUNCTION DEFINITION FROM HERE
// // Function to get currency from Settings (to avoid hardcoding)
// let appSettings = null; // Will be populated dynamically
// async function getCurrency() {
//   if (!appSettings) {
//     // Lazy load Settings model to prevent circular dependency
//     const Settings =
//       mongoose.models.Settings ||
//       mongoose.model('Settings', require('./Settings').schema);
//     appSettings = await Settings.findOne({ settingsId: 'app_settings' });
//     if (!appSettings) {
//       console.warn('Settings document not found. Using default currency USD.');
//       appSettings = { general: { currency: 'USD' } }; // Fallback
//     }
//   }
//   return appSettings.general.currency;
// }

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'savings_contribution',
        'savings_withdrawal',
        'loan_disbursement',
        'loan_repayment',
        'interest_earned', // Renamed from 'interest_payment' for savings
        'interest_charged', // For loan interest
        'penalty_incurred', // For penalties on loans/contributions
        'penalty_paid', // When penalties are paid
        'fee_incurred', // For other fees
        'fee_paid', // When fees are paid
        'transfer_in', // For transfers into an account
        'transfer_out', // For transfers out of an account
        'refund',
        'adjustment', // For manual balance corrections
        'adjustment_credit',
        'adjustment_debit',
      ],
      required: true,
    },
    account: {
      // The account affected by this transaction
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    member: {
      // The primary member involved in the transaction (can be null for group-level transactions)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    group: {
      // The group involved in the transaction (can be null for system-level transactions not tied to a group)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
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
      default: 'completed', // Most transactions are completed immediately
    },
    // Reference to related entities - make this polymorphic
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntityType',
    },
    relatedEntityType: {
      type: String,
      enum: ['Loan', 'Guarantor', 'Account'], // Removed Savings/Repayment as they're absorbed
    },
    // For tracking running balance of the affected account
    balanceAfter: {
      type: Number,
      // min: [0, 'Balance after cannot be negative'],
      required: true, // This is crucial for auditing
    },
    // For approval workflow (e.g., for large withdrawals or specific disbursements)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    // For receipts
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null for transactions without receipts
    },
    // For audit trail: who initiated/recorded this transaction
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: payment method if relevant for the transaction type
    paymentMethod: {
      type: String,
      enum: ['cash', 'mobile', 'bank', 'cheque', 'system_generated'], // 'system_generated' for interest, fees
    },
    // Soft delete fields
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Generate receipt number (only if status is completed and receipt number not provided)
transactionSchema.pre('save', async function (next) {
  if (this.isNew && !this.receiptNumber && this.status === 'completed') {
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
transactionSchema.index({ relatedEntity: 1, relatedEntityType: 1 }); // Compound for polymorphic
transactionSchema.index({ deleted: 1 });

// Virtual for formatted amount (now dynamic based on Settings)
transactionSchema.virtual('formattedAmount').get(async function () {
  // Use the imported helper
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(this.amount);
});

// Virtual for transaction type label
transactionSchema.virtual('typeLabel').get(function () {
  const labels = {
    savings_contribution: 'Savings Contribution',
    savings_withdrawal: 'Savings Withdrawal',
    loan_disbursement: 'Loan Disbursement',
    loan_repayment: 'Loan Repayment',
    interest_earned: 'Interest Earned',
    interest_charged: 'Interest Charged',
    penalty_incurred: 'Penalty Incurred',
    penalty_paid: 'Penalty Paid',
    fee_incurred: 'Fee Incurred',
    fee_paid: 'Fee Paid',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    refund: 'Refund',
    adjustment: 'Adjustment',
  };
  return labels[this.type] || this.type;
});

// Ensure virtuals are serialized (need to handle async virtuals in routes/controllers)
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true }); // Also for toObject

module.exports = mongoose.model('Transaction', transactionSchema);
