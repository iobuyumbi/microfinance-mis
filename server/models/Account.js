// server\models\Account.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('../utils/currencyUtils');

const accountSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerModel',
      required: true,
      unique: true, // Each User/Group should have only one savings account
    },
    ownerModel: {
      type: String,
      enum: ['User', 'Group'],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    type: {
      // e.g., 'savings', 'loan_disbursement_fund'
      type: String,
      enum: ['savings', 'loan_fund', 'operating_expense', 'revenue'],
      default: 'savings',
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted balance (now dynamic)
accountSchema.virtual('formattedBalance').get(async function () {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.balance);
});

module.exports = mongoose.model('Account', accountSchema);
