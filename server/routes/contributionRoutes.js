const express = require('express');
const {
  getAllContributions,
  getContribution,
  createContribution,
  updateContribution,
  deleteContribution,
  getGroupContributions,
  getContributionSummary,
  bulkImportContributions,
  exportContributions,
  getMemberContributionHistory,
  updateMemberContribution,
} = require('../controllers/contributionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible to Admin and Officer
router
  .route('/')
  .get(authorize('admin', 'officer'), getAllContributions)
  .post(authorize('admin', 'officer'), createContribution);

router
  .route('/:id')
  .get(authorize('admin', 'officer'), getContribution)
  .put(authorize('admin', 'officer'), updateContribution)
  .delete(authorize('admin'), deleteContribution);

// Group-specific routes
router
  .route('/groups/:groupId/contributions')
  .get(authorize('admin', 'officer', 'leader'), getGroupContributions);

router
  .route('/groups/:groupId/contributions/summary')
  .get(authorize('admin', 'officer', 'leader'), getContributionSummary);

router
  .route('/groups/:groupId/contributions/bulk')
  .post(authorize('admin', 'officer'), bulkImportContributions);

router
  .route('/groups/:groupId/contributions/export')
  .get(authorize('admin', 'officer'), exportContributions);

// Member-specific routes
router
  .route('/members/:memberId/contributions')
  .get(authorize('admin', 'officer', 'leader'), getMemberContributionHistory)
  .put(authorize('admin', 'officer'), updateMemberContribution);

module.exports = router;
