const Settings = require('../models/Settings');

// GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings (admin only)
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    // Only update provided fields
    Object.assign(settings, req.body);
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/reset (admin only)
exports.resetSettings = async (req, res, next) => {
  try {
    // Delete existing settings and create new ones with defaults
    await Settings.deleteMany({});
    const defaultSettings = await Settings.create({});
    res.status(200).json({ success: true, data: defaultSettings });
  } catch (error) {
    next(error);
  }
};
