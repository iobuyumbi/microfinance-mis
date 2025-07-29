// server\models\Notification.js
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

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Added index
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error', 'alert'], // Added 'alert'
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true, // Added index for read status
    },
    // Polymorphic reference for related entity
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
      index: true, // Added index
    },
    referenceModel: {
      type: String,
      enum: ['Loan', 'Transaction', 'Guarantor', 'User', 'Group'], // Updated enums (removed Savings/Repayment)
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for getting unread notifications for a user, ordered by creation date
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Example virtual if notification involves an amount (though not directly on schema)
// notificationSchema.virtual('formattedAmount').get(async function () {
//     // You would need to populate referenceId and then access its amount field
//     if (this.referenceModel === 'Transaction' && this.referenceId && this.referenceId.amount) {
//         const currency = await getCurrency();
//         return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(this.referenceId.amount);
//     }
//     return null;
// });

module.exports = mongoose.model('Notification', notificationSchema);
