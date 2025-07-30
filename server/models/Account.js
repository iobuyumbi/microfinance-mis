// server\models\Account.js
const mongoose = require('mongoose');
// Function to get currency from Settings (to avoid hardcoding)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('./Settings').schema);
    appSettings = await Settings.findOne({ settingsId: 'app_settings' });
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

const accountSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerModel',
      required: true,
      unique: true, // Each User/Group should have only one account
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted balance (now dynamic)
accountSchema.virtual('formattedBalance').get(async function () {
  const currency = await getCurrency();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(this.balance);
});

module.exports = mongoose.model('Account', accountSchema);
