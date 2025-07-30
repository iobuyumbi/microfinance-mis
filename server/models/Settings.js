// server\models\Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Use a different field name to avoid _id conflicts
    settingsId: {
      type: String,
      default: 'app_settings', // A fixed string ID to ensure only one document
      unique: true,
      required: true,
    },
    general: {
      organizationName: { type: String, default: 'Chama Solutions Ltd' },
      currency: { type: String, default: 'KES' }, // Changed to KES
      timezone: { type: String, default: 'Africa/Nairobi' }, // Changed to Africa/Nairobi (EAT)
      language: { type: String, default: 'English' }, // Or "Swahili"
      dateFormat: { type: String, default: 'DD/MM/YYYY' }, // Common in Kenya
    },
    loan: {
      defaultInterestRate: { type: Number, default: 12.5 },
      maxLoanAmount: { type: Number, default: 50000 },
      minLoanAmount: { type: Number, default: 500 },
      defaultLoanTerm: { type: Number, default: 12 },
      gracePeriod: { type: Number, default: 7 },
      lateFee: { type: Number, default: 25 },
    },
    savings: {
      defaultInterestRate: { type: Number, default: 3.5 },
      minBalance: { type: Number, default: 100 },
      withdrawalLimit: { type: Number, default: 5000 },
      maintenanceFee: { type: Number, default: 5 },
      compoundingFrequency: { type: String, default: 'Monthly' },
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      paymentReminders: { type: Boolean, default: true },
      overdueAlerts: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: true },
      reminderDays: { type: Number, default: 3 },
    },
    security: {
      sessionTimeout: { type: Number, default: 30 },
      passwordExpiry: { type: Number, default: 90 },
      twoFactorAuth: { type: Boolean, default: false },
      loginAttempts: { type: Number, default: 5 },
      auditLog: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
