// server\controllers\settingsController.js
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation (though not strictly needed for fixed _id)

// The fixed ID for the single settings document
const SETTINGS_ID = 'app_settings';

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private (Accessible by all authenticated users, but only admin can modify)
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Attempt to find the single settings document by its fixed ID
  let settings = await Settings.findById(SETTINGS_ID);

  // If no settings document exists, create it with defaults
  if (!settings) {
    settings = await Settings.create({ _id: SETTINGS_ID }); // Ensure _id is set during creation
  }

  res.status(200).json({ success: true, data: settings });
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private (Admin only) - authorize('admin') middleware handles this
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // Find the settings document by its fixed ID
  let settings = await Settings.findById(SETTINGS_ID);

  // If settings don't exist, create them first (though getSettings should have handled this)
  if (!settings) {
    settings = await Settings.create({ _id: SETTINGS_ID });
  }

  // Only update provided fields from req.body
  // Use Object.assign or loop through req.body to apply updates.
  // Be careful with nested objects if not using a deep merge utility.
  // For simplicity, assuming direct field updates or shallow merge.
  // For nested fields like general.currency, req.body should match the structure.
  // Example: req.body = { general: { currency: 'USD' }, loan: { defaultInterestRate: 10 } }
  Object.assign(settings, req.body);

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully.',
    data: settings,
  });
});

// @desc    Reset application settings to defaults
// @route   POST /api/settings/reset
// @access  Private (Admin only) - authorize('admin') middleware handles this
exports.resetSettings = asyncHandler(async (req, res, next) => {
  // Find and delete the existing settings document by its fixed ID
  const deletedSettings = await Settings.findByIdAndDelete(SETTINGS_ID);

  // Create a new settings document, which will use the schema defaults
  const defaultSettings = await Settings.create({ _id: SETTINGS_ID });

  res.status(200).json({
    success: true,
    message: 'Settings reset to default values successfully.',
    data: defaultSettings,
  });
});
