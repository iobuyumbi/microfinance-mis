// Centralized settings helper utilities
const mongoose = require('mongoose');
const Constants = require('./constants');

// Helper to get currency from settings (using the centralized currencyUtils)
async function getCurrency() {
  const currencyUtils = require('./currencyUtils');
  return currencyUtils.getCurrencyFromSettings();
}

// Helper to get all settings (for future use)
async function getSettings() {
  try {
    let Settings;
    if (mongoose.models.Settings) {
      Settings = mongoose.models.Settings;
    } else {
      Settings = mongoose.model('Settings', require('../models/Settings').schema);
    }
    
    const settings = await Settings.findOne();
    return settings || {}; // Return empty object if no settings found
  } catch (error) {
    console.error('Error fetching settings:', error);
    return {}; // Fallback empty settings
  }
}

module.exports = {
  getCurrency,
  getSettings,
};
