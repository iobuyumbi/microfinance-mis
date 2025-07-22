const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");

// GET /api/settings - anyone authenticated can view
router.get("/", protect, getSettings);
// PUT /api/settings - only admin can update
router.put("/", protect, authorize("admin"), updateSettings);

module.exports = router; 