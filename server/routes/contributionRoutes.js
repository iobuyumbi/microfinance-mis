// server\routes\contributionRoutes.js
const express = require('express');
const router = express.Router();
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
} = require('../controllers/contributionController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');
const { asyncHandler } = require('../middleware');

// All contribution routes are protected
router.use(protect);

// --- General Contribution Routes ---
router
  .route('/')
  .post(
    validateRequiredFields(['memberId', 'groupId', 'memberName', 'principal']),
    authorize('admin', 'officer'),
    asyncHandler(createContribution)
  )
  .get(authorize('admin', 'officer'), asyncHandler(getAllContributions));

router
  .route('/:id')
  .get(
    validateObjectId,
    authorize('admin', 'officer'),
    asyncHandler(getContribution)
  )
  .put(
    validateObjectId,
    authorize('admin', 'officer'),
    asyncHandler(updateContribution)
  )
  .delete(
    validateObjectId,
    authorize('admin', 'officer'),
    asyncHandler(deleteContribution)
  );

// --- Group-Specific Contribution Routes ---
router
  .route('/groups/:groupId/contributions')
  .get(
    validateObjectId,
    authorize('admin', 'officer', 'leader'),
    asyncHandler(getGroupContributions)
  );

router
  .route('/groups/:groupId/contributions/summary')
  .get(
    validateObjectId,
    authorize('admin', 'officer', 'leader'),
    asyncHandler(getContributionSummary)
  );

router
  .route('/groups/:groupId/contributions/bulk')
  .post(
    validateObjectId,
    authorize('admin', 'officer'),
    asyncHandler(bulkImportContributions)
  );

router
  .route('/groups/:groupId/contributions/export')
  .get(
    validateObjectId,
    authorize('admin', 'officer', 'leader'),
    asyncHandler(exportContributions)
  );

// --- Member-Specific Contribution Routes ---
router
  .route('/members/:memberId/contributions')
  .get(
    validateObjectId,
    authorize('admin', 'officer'),
    asyncHandler(getMemberContributionHistory)
  );

module.exports = router;
