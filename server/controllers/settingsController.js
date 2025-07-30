// server\controllers\settingsController.js (REVISED)
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse } = require('../utils');
const mongoose = require('mongoose');

// The fixed ID for the single settings document
const SETTINGS_ID = 'app_settings';

/**
 * Helper function to deeply merge objects.
 * This is useful for updating nested settings without overwriting entire sub-objects.
 * @param {object} target - The object to merge into (modified in place).
 * @param {object} source - The object to merge from.
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        if (
          !target[key] ||
          typeof target[key] !== 'object' ||
          Array.isArray(target[key])
        ) {
          target[key] = {}; // Ensure target property is an object if source is
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private (Accessible by all authenticated users)
exports.getSettings = asyncHandler(async (req, res, next) => {
  // Attempt to find the single settings document by its fixed ID
  let settings = await Settings.findOne({ settingsId: SETTINGS_ID });

  // If no settings document exists, create it with defaults
  if (!settings) {
    // Create with the new settingsId field
    settings = await Settings.create({ settingsId: SETTINGS_ID });
    console.log('Default settings document created as it did not exist.');
  }

  res.status(200).json({ success: true, data: settings });
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private (Admin only) - authorize('admin') middleware handles this
exports.updateSettings = asyncHandler(async (req, res, next) => {
  // Find the settings document by its fixed ID
  let settings = await Settings.findOne({ settingsId: SETTINGS_ID });

  // If settings don't exist, create them first (though getSettings should ideally ensure existence)
  if (!settings) {
    settings = await Settings.create({ settingsId: SETTINGS_ID });
    console.warn(
      'Settings document not found during update, created a new one.'
    );
  }

  // Use deepMerge to handle nested objects gracefully
  deepMerge(settings, req.body);

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
  // Start a session for atomicity, especially if other operations depend on settings
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and delete the existing settings document by its fixed ID
    const deletedSettings = await Settings.findOneAndDelete(
      { settingsId: SETTINGS_ID },
      {
        session,
      }
    );

    // Create a new settings document, which will use the schema defaults
    const defaultSettings = await Settings.create(
      [{ settingsId: SETTINGS_ID }],
      {
        session,
      }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Settings reset to default values successfully.',
      data: defaultSettings[0], // Access the first element as create returns an array
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error resetting settings:', error);
    return next(new ErrorResponse('Failed to reset settings.', 500));
  }
});
