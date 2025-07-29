// server\routes\reportRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  upcomingRepayments,
  totalLoansDisbursed,
  groupSavingsPerformance,
  activeLoanDefaulters,
  financialSummary,
  getDashboardStats,
  getRecentActivity,
} = require('../controllers/reportController');
const { protect, authorize, filterDataByRole } = require('../middleware/auth'); // Ensure filterDataByRole is imported

// Report routes - all protected with role-based access
router.use(protect);

// Dashboard endpoints - these typically require broader data aggregation,
// so filterDataByRole for 'Report' type is useful, which can set multiple filters for different models.
router.get('/dashboard', filterDataByRole('Report'), getDashboardStats);
router.get('/recent-activity', filterDataByRole('Report'), getRecentActivity);

// Other report endpoints
// Upcoming Repayments: Filters based on accessible loans
router.get(
  '/upcoming-repayments',
  filterDataByRole('Loan'),
  upcomingRepayments
);

// Total Loans Disbursed: Filters based on accessible loans
router.get('/total-loans', filterDataByRole('Loan'), totalLoansDisbursed);

// Group Savings Performance: Filters based on accessible groups
router.get(
  '/group-savings-performance',
  filterDataByRole('Group'),
  groupSavingsPerformance
);
router.get(
  '/group-savings',
  filterDataByRole('Group'),
  groupSavingsPerformance
); // Alias

// Active Loan Defaulters: Filters based on accessible loans
router.get(
  '/active-loan-defaulters',
  filterDataByRole('Loan'),
  activeLoanDefaulters
);
router.get('/defaulters', filterDataByRole('Loan'), activeLoanDefaulters); // Alias

// Financial Summary: Filters based on accessible transactions
router.get(
  '/financial-summary',
  filterDataByRole('Transaction'),
  financialSummary
);

module.exports = router;
