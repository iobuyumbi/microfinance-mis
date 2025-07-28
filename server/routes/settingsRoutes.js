const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/settings - anyone authenticated can view
router.get('/', protect, getSettings);
// PUT /api/settings - only admin can update
router.put('/', protect, authorize('admin'), updateSettings);
// POST /api/settings/reset - only admin can reset
router.post('/reset', protect, authorize('admin'), resetSettings);

module.exports = router;
