// server\models\Notification.js (REVISED)
const mongoose = require('mongoose');

// --- Keep getCurrency if it's used elsewhere or you plan to uncomment the virtual ---
// It's generally better to put such utilities in a separate /utils/ folder
// if they are not strictly tied to a schema's virtuals.
// For now, leaving it as is, assuming a future use or that you're just showing context.
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
// --- End getCurrency ---

const notificationSchema = new mongoose.Schema(
  {
    // === CRITICAL FIX 1: Make recipient polymorphic ===
    // This field represents WHO receives the notification (User or Group)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel', // IMPORTANT: This makes it polymorphic
      required: true,
      index: true,
    },
    recipientModel: {
      type: String,
      enum: ['User', 'Group'], // Now correctly reflects controller's validation
      required: true, // This field is now required for refPath to work
    },
    // ===============================================

    // === CRITICAL FIX 2: Add 'title' and make it optional if message is primary ===
    // Your controller doesn't send 'title' in `createNotification`
    title: {
      type: String,
      // required: [true, 'Notification title is required'], // Removed required
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // ==============================================================================

    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error', 'alert'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // === CRITICAL FIX 3: Add 'link' field ===
    // Your controller uses 'link' but it's not in the schema.
    link: {
      type: String,
      trim: true,
      maxlength: [500, 'Link cannot exceed 500 characters'],
    },
    // =======================================

    // === CRITICAL FIX 4: Add 'sender' field ===
    // Your controller uses 'sender' but it's not in the schema.
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true, // Notifications should always have a sender (system or user)
    },
    // =========================================

    // Polymorphic reference for the ENTITY the notification is ABOUT
    // (e.g., a loan, a transaction, a user, a group, etc.)
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'referenceModel',
      index: true,
    },
    referenceModel: {
      type: String,
      enum: ['Loan', 'Transaction', 'Guarantor', 'User', 'Group'],
    },

    // === CRITICAL FIX 5: Add soft delete fields ===
    // Your controller's delete method relies on these.
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // For efficient filtering of non-deleted notifications
    },
    deletedAt: {
      type: Date,
    },
    // ============================================
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for getting unread notifications for a user, ordered by creation date
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 }); // Good for seeing notifications sent by someone

// Example virtual if notification involves an amount (still commented out, but illustrative)
// notificationSchema.virtual('formattedAmount').get(async function () {
//     // You would need to populate referenceId and then access its amount field
//     if (this.referenceModel === 'Transaction' && this.referenceId && this.referenceId.amount) {
//         const currency = await getCurrency();
//         return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(this.referenceId.amount);
//     }
//     return null;
// });

module.exports = mongoose.model('Notification', notificationSchema);
