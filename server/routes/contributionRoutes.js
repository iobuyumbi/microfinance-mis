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
const {
  protect,
  authorize,
  filterDataByRole,
  authorizeGroupAccess, // For group-specific routes
  authorizeOwnerOrAdmin, // For member-specific routes
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// All contribution routes are protected
router.use(protect);

// --- General Contribution Routes ---
router
  .route('/')
  .post(
    validateRequiredFields(['memberId', 'groupId', 'amount']), // Basic validation for creation
    // Authorization for createContribution is handled INSIDE the controller
    // This allows flexibility for members creating their own, or leaders for their group members.
    createContribution
  )
  .get(
    filterDataByRole('Transaction'), // Filters all transactions of type 'savings_contribution'
    getAllContributions
  );

router
  .route('/:id')
  .get(
    validateObjectId,
    filterDataByRole('Transaction'), // Ensures user can only view accessible contributions
    getContribution
  )
  .put(
    validateObjectId,
    authorize('admin', 'officer'), // Only Admins/Officers can update contributions (non-financial fields)
    filterDataByRole('Transaction'), // Ensures even admins/officers are acting on accessible data
    updateContribution
  )
  .delete(
    validateObjectId,
    authorize('admin', 'officer'), // Only Admins/Officers can soft-delete contributions
    filterDataByRole('Transaction'), // Ensures even admins/officers are acting on accessible data
    deleteContribution
  );

// --- Group-Specific Contribution Routes ---
router.route('/groups/:groupId/contributions').get(
  validateObjectId, // Validate groupId
  authorizeGroupAccess('groupId'), // Ensures user has general access to this group
  filterDataByRole('Transaction'), // Further filters transactions within that group
  getGroupContributions
);

router.route('/groups/:groupId/contributions/summary').get(
  validateObjectId, // Validate groupId
  authorizeGroupAccess('groupId'), // Ensures user has general access to this group
  authorize('admin', 'officer', 'leader'), // Only these roles can view summary
  filterDataByRole('Transaction'), // Filters transactions for aggregation
  getContributionSummary
);

router.route('/groups/:groupId/contributions/bulk').post(
  validateObjectId, // Validate groupId
  authorize('admin', 'officer'), // Only Admins/Officers can perform bulk imports
  bulkImportContributions
);

router.route('/groups/:groupId/contributions/export').get(
  validateObjectId, // Validate groupId
  authorizeGroupAccess('groupId'), // Ensures user has general access to this group
  authorize('admin', 'officer', 'leader'), // Only these roles can export
  filterDataByRole('Transaction'), // Filters transactions for export
  exportContributions
);

// --- Member-Specific Contribution Routes ---
router.route('/members/:memberId/contributions').get(
  validateObjectId, // Validate memberId
  authorizeOwnerOrAdmin('memberId'), // Ensures user is owner OR admin/officer
  filterDataByRole('Transaction'), // Filters transactions for that member
  getMemberContributionHistory
);

module.exports = router;
