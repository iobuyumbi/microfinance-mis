const express = require("express");
const router = express.Router();
const {
  upcomingRepayments,
  totalLoansDisbursed,
  groupSavingsPerformance,
  activeLoanDefaulters,
  financialSummary,
  getDashboardStats,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

// Report routes - all protected and restricted to admin/officer
router.use(protect);
router.use(authorize("admin", "officer"));

// Dashboard endpoint
router.get("/dashboard", getDashboardStats);

// Other report endpoints
router.get("/upcoming-repayments", upcomingRepayments);
router.get("/total-loans", totalLoansDisbursed);
router.get("/group-savings", groupSavingsPerformance);
router.get("/defaulters", activeLoanDefaulters);
router.get("/financial-summary", financialSummary);

module.exports = router;
