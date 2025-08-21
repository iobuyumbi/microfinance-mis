// server\models\Loan.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('../utils/currencyUtils');

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
      enum: ['pending', 'approved', 'rejected', 'disbursed', 'partially_paid', 'paid', 'completed', 'overdue'],
      default: 'pending',
      required: true,
      index: true,
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true, // Added index
    },
    repaymentSchedule: [repaymentScheduleSchema],
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// Virtual for formatted loan amount
loanSchema.virtual('formattedAmountRequested').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.amountRequested);
});

// Virtual for formatted approved amount
loanSchema.virtual('formattedAmountApproved').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.amountApproved);
});

module.exports = mongoose.model('Loan', loanSchema);
