
const express = require('express');
const {
  getSettings,
  updateSettings,
  resetSettings,
  getSettingCategory,
  updateSettingCategory
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// General settings routes
router.route('/')
  .get(authorize('admin', 'officer'), getSettings)
  .put(authorize('admin'), updateSettings);

// Reset settings (admin only)
router.post('/reset', authorize('admin'), resetSettings);

// Category-specific routes
router.route('/:category')
  .get(authorize('admin', 'officer'), getSettingCategory)
  .put(authorize('admin', 'officer'), updateSettingCategory);

module.exports = router;
