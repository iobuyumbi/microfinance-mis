// server\utils\currencyUtils.js
const mongoose = require('mongoose');
const Constants = require('./constants');

/**
 * Currency utilities for consistent currency handling across the application
 */

// Lazy load Settings model to prevent circular dependency if Settings also uses this util
let appSettingsCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Get currency from settings with caching for performance
 * @returns {Promise<string>} The currency code
 */
async function getCurrencyFromSettings() {
  const now = Date.now();
  
  // Refresh cache if it's expired or doesn't exist
  if (!appSettingsCache || !cacheTimestamp || (now - cacheTimestamp > CACHE_TTL)) {
    try {
      const Settings =
        mongoose.models.Settings ||
        mongoose.model('Settings', require('../models/Settings').schema);
      
      appSettingsCache = await Settings.findOne({ settingsId: 'app_settings' });
      cacheTimestamp = now;
      
      if (!appSettingsCache) {
        console.warn(`Settings document not found. Using default currency ${Constants.DEFAULT_CURRENCY}.`);
        appSettingsCache = { general: { currency: Constants.DEFAULT_CURRENCY } }; // Fallback
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
      return Constants.FALLBACK_CURRENCY; // Use fallback in case of error
    }
  }
  
  return appSettingsCache.general?.currency || Constants.FALLBACK_CURRENCY;
}

/**
 * Format a number as currency with the system's currency setting
 * @param {number} amount - The amount to format
 * @param {string} [forceCurrency] - Optional currency code to override settings
 * @returns {Promise<string>} Formatted currency string
 */
async function formatCurrency(amount, forceCurrency = null) {
  const currency = forceCurrency || await getCurrencyFromSettings();
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number as compact currency (e.g., 1.5K, 2.3M)
 * @param {number} amount - The amount to format
 * @param {string} [forceCurrency] - Optional currency code to override settings
 * @returns {Promise<string>} Formatted compact currency string
 */
async function formatCompactCurrency(amount, forceCurrency = null) {
  const currency = forceCurrency || await getCurrencyFromSettings();
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
}

module.exports = {
  getCurrencyFromSettings,
  formatCurrency,
  formatCompactCurrency
};
