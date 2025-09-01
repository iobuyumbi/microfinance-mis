
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private (Admin/Officer)
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ settingsId: 'app_settings' });
  
  if (!settings) {
    // Create default settings if none exist
    settings = await Settings.create({ settingsId: 'app_settings' });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin role required.', 403));
  }

  let settings = await Settings.findOne({ settingsId: 'app_settings' });
  
  if (!settings) {
    // Create new settings if none exist
    settings = await Settings.create({
      settingsId: 'app_settings',
      ...req.body
    });
  } else {
    // Update existing settings
    Object.keys(req.body).forEach(key => {
      if (key !== 'settingsId' && key !== '_id') {
        settings[key] = req.body[key];
      }
    });
    await settings.save();
  }

  res.status(200).json({
    success: true,
    data: settings,
    message: 'Settings updated successfully'
  });
});

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private (Admin only)
const resetSettings = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin role required.', 403));
  }

  // Delete existing settings
  await Settings.deleteOne({ settingsId: 'app_settings' });
  
  // Create new default settings
  const settings = await Settings.create({ settingsId: 'app_settings' });

  res.status(200).json({
    success: true,
    data: settings,
    message: 'Settings reset to default successfully'
  });
});

// @desc    Get specific setting category
// @route   GET /api/settings/:category
// @access  Private
const getSettingCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  const settings = await Settings.findOne({ settingsId: 'app_settings' });
  
  if (!settings) {
    return next(new ErrorResponse('Settings not found', 404));
  }

  if (!settings[category]) {
    return next(new ErrorResponse(`Setting category '${category}' not found`, 404));
  }

  res.status(200).json({
    success: true,
    data: settings[category]
  });
});

// @desc    Update specific setting category
// @route   PUT /api/settings/:category
// @access  Private (Admin/Officer for most, Admin only for security and system)
const updateSettingCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  // Restrict certain categories to admin only
  const adminOnlyCategories = ['security', 'system'];
  if (adminOnlyCategories.includes(category) && req.user.role !== 'admin') {
    return next(new ErrorResponse('Access denied. Admin role required for this setting category.', 403));
  }

  let settings = await Settings.findOne({ settingsId: 'app_settings' });
  
  if (!settings) {
    settings = await Settings.create({ settingsId: 'app_settings' });
  }

  if (!settings[category]) {
    return next(new ErrorResponse(`Setting category '${category}' not found`, 404));
  }

  // Update the category
  settings[category] = { ...settings[category], ...req.body };
  await settings.save();

  res.status(200).json({
    success: true,
    data: settings[category],
    message: `${category} settings updated successfully`
  });
});

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
  getSettingCategory,
  updateSettingCategory
};
