// server\routes\healthRoutes.js
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// @route   GET /api/health
// @desc    Check backend server health
// @access  Public (no protection needed for a health check)
router.get('/', healthController.checkHealth);

module.exports = router;
