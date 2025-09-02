// server\models\Loan.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('../utils/currencyUtils');
// Assuming DecimalUtils is available in '../utils/decimalUtils'
const DecimalUtils = require('../utils/decimalUtils');


// Embedded schema for each repayment installment
const repaymentScheduleSchema = new mongoose.Schema(
  {
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: [1, 'Installment amount must be positive'],
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
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
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Requested amount is required'],
      min: [10, 'Minimum loan amount is 10'],
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
    amountApproved: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Approved amount cannot be negative'],
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
      // Consider adding required: true if status is 'approved' (can be done with custom validation)
    },
    interestRate: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => DecimalUtils.toDecimal(10), // Default to 10%
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100'],
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
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

    // Added fields from changes, ensuring they are Decimal128 where appropriate
    monthlyPayment: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
    totalInterest: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => DecimalUtils.toDecimal(0),
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
    outstandingBalance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
    amountPaid: {
      type: mongoose.Schema.Types.Decimal128,
      default: () => DecimalUtils.toDecimal(0),
      set: value => DecimalUtils.toDecimal(value),
      get: value => DecimalUtils.toNumber(value)
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔍 Instance method to calculate total outstanding (unpaid) balance
loanSchema.methods.getOutstandingBalance = function () {
  if (!this.repaymentSchedule?.length) return DecimalUtils.toDecimal(0);
  return this.repaymentSchedule
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + DecimalUtils.toNumber(r.amount), 0); // Ensure sum is in number format
};

// Virtual for formatted loan amount
loanSchema.virtual('formattedAmountRequested').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.amountRequested)); // Use getter
});

// Virtual for formatted approved amount
loanSchema.virtual('formattedAmountApproved').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.amountApproved)); // Use getter
});

// Virtual for formatted monthly payment
loanSchema.virtual('formattedMonthlyPayment').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.monthlyPayment)); // Use getter
});

// Virtual for formatted total amount
loanSchema.virtual('formattedTotalAmount').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.totalAmount)); // Use getter
});

// Virtual for formatted outstanding balance
loanSchema.virtual('formattedOutstandingBalance').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.outstandingBalance)); // Use getter
});

// Virtual for formatted amount paid
loanSchema.virtual('formattedAmountPaid').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(DecimalUtils.toNumber(this.amountPaid)); // Use getter
});


module.exports = mongoose.model('Loan', loanSchema);