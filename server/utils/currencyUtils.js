// server\utils\currencyUtils.js
const mongoose = require('mongoose');
// Lazy load Settings model to prevent circular dependency if Settings also uses this util
let appSettingsCache = null;

async function getCurrencyFromSettings() {
  if (!appSettingsCache) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('../models/Settings').schema);
    appSettingsCache = await Settings.findOne({ settingsId: 'app_settings' });
    if (!appSettingsCache) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettingsCache = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettingsCache.general?.currency || 'USD';
}

// You can add more currency-related utilities here if needed
exports.getCurrencyFromSettings = getCurrencyFromSettings;
