
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRealTimeMetrics,
  exportDashboardData
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Real-time metrics
router.get('/metrics', getRealTimeMetrics);

// Export dashboard data
router.get('/export', exportDashboardData);

module.exports = router;
