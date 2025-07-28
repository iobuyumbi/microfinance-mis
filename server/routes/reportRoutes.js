const express = require("express");
const router = express.Router();
const {
  upcomingRepayments,
  totalLoansDisbursed,
  groupSavingsPerformance,
  activeLoanDefaulters,
  financialSummary,
  getDashboardStats,
  getRecentActivity,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

// Report routes - all protected with role-based access
router.use(protect);

// Dashboard endpoints
router.get("/dashboard", getDashboardStats);
router.get("/recent-activity", getRecentActivity);

// Other report endpoints
router.get("/upcoming-repayments", upcomingRepayments);
router.get("/total-loans", totalLoansDisbursed);
router.get("/group-savings-performance", groupSavingsPerformance);
router.get("/active-loan-defaulters", activeLoanDefaulters);
router.get("/financial-summary", financialSummary);

// Alias routes for backward compatibility
router.get("/group-savings", groupSavingsPerformance);
router.get("/defaulters", activeLoanDefaulters);

module.exports = router;
