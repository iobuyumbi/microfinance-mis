// Centralized settings helper utilities
const mongoose = require('mongoose');

// Helper to get currency from settings (centralized to avoid duplication)
async function getCurrency() {
  try {
    let Settings;
    if (mongoose.models.Settings) {
      Settings = mongoose.models.Settings;
    } else {
      Settings = mongoose.model('Settings', require('../models/Settings').schema);
    }
    
    const settings = await Settings.findOne();
    return settings?.currency || 'USD'; // Default fallback
  } catch (error) {
    console.error('Error fetching currency from settings:', error);
    return 'USD'; // Fallback currency
  }
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
