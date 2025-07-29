// server\models\Loan.js
const mongoose = require('mongoose');

// Function to get currency from Settings (to avoid hardcoding)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('./Settings').schema);
    appSettings = await Settings.findById('app_settings');
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

// Embedded schema for each repayment installment
const repaymentScheduleSchema = new mongoose.Schema(
  {
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Installment amount must be positive'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: { type: Date },
    method: {
      type: String,
      enum: ['cash', 'mobile', 'bank'],
      default: 'mobile',
    },
  },
  {
    _id: false, // Prevents creation of an _id for each subdocument
  }
);

// Main Loan schema
const loanSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'borrowerModel', // Supports dynamic referencing (User or Group)
      required: true,
      index: true, // Added index
    },
    borrowerModel: {
      type: String,
      enum: ['User', 'Group'],
      required: true,
      index: true, // Added index
    },
    amountRequested: {
      type: Number,
      required: [true, 'Requested amount is required'],
      min: [10, 'Minimum loan amount is 10'],
    },
    amountApproved: {
      type: Number,
      min: [0, 'Approved amount cannot be negative'],
      // Consider adding required: true if status is 'approved' (can be done with custom validation)
    },
    interestRate: {
      type: Number,
      default: 10,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100'],
    },
    loanTerm: {
      type: Number, // In months
      required: [true, 'Loan term is required'],
      min: [1, 'Loan term must be at least 1 month'],
      max: [60, 'Loan term cannot exceed 60 months'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'overdue'], // Added 'overdue'
      default: 'pending',
      required: true,
      index: true, // Added index
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true, // Added index
    },
    repaymentSchedule: [repaymentScheduleSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 Instance method to calculate total outstanding (unpaid) balance
loanSchema.methods.getOutstandingBalance = function () {
  if (!this.repaymentSchedule?.length) return 0;
  return this.repaymentSchedule
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
};

// Virtual for formatted amounts
loanSchema.virtual('formattedAmountRequested').get(async function () {
  const currency = await getCurrency();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.amountRequested);
});
loanSchema.virtual('formattedAmountApproved').get(async function () {
  if (this.amountApproved == null) return null;
  const currency = await getCurrency();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.amountApproved);
});

module.exports = mongoose.model('Loan', loanSchema);
