// server\routes\contributionRoutes.js (REVISED)
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
  authorize, // For general role checks
  filterDataByRole, // For data filtering based on role
  authorizeGroupAccess, // For group-specific access
  authorizeOwnerOrAdmin, // For member-specific access (e.g., to their own contributions)
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');
// const { asyncHandler } = require('../middleware'); // REMOVED: No longer needed here as controllers are wrapped

// All contribution routes are protected
router.use(protect);

// --- Group-Specific Contribution Routes (must come before /:id) ---
router.get('/groups/:groupId',
  validateObjectId,
  authorizeGroupAccess('groupId'), // Ensure user has access to this group
  filterDataByRole('Transaction'), // Further filter transactions within the group
  getGroupContributions // REMOVED asyncHandler wrapper
);

router.get('/groups/:groupId/summary',
  validateObjectId,
  authorizeGroupAccess('groupId'), // Ensure user has access to this group
  filterDataByRole('Transaction'), // Further filter transactions within the group
  getContributionSummary // REMOVED asyncHandler wrapper
);

router.post('/groups/:groupId/bulk',
  validateObjectId,
  authorize('admin', 'officer'), // Bulk import is a powerful admin/officer tool
  bulkImportContributions // REMOVED asyncHandler wrapper
);

router.get('/groups/:groupId/export',
  validateObjectId,
  authorizeGroupAccess('groupId'), // Ensure user has access to this group
  authorize('admin', 'officer', 'leader'), // Only admin, officer, and leader can export
  filterDataByRole('Transaction'), // Further filter transactions within the group
  exportContributions // REMOVED asyncHandler wrapper
);

// --- Member-Specific Contribution Routes (must come before /:id) ---
router.get('/members/:memberId/contributions',
  validateObjectId,
  // Authorize access to the member's data (either self, admin, officer, or leader if in same group)
  authorizeOwnerOrAdmin('memberId'), // Assumes memberId is in req.params
  filterDataByRole('Transaction'), // Further filter transactions related to the member
  getMemberContributionHistory // REMOVED asyncHandler wrapper
);

// --- General Contribution Routes ---
router
  .route('/')
  .post(
    validateRequiredFields(['memberId', 'groupId', 'amount']), // 'amount' instead of 'principal'
    // Authorization is handled robustly within createContribution controller based on user role
    createContribution // REMOVED asyncHandler wrapper
  )
  .get(
    filterDataByRole('Transaction'), // Allows Admin/Officer/Leader/Member to see accessible transactions
    getAllContributions // REMOVED asyncHandler wrapper
  );

router
  .route('/:id')
  .get(
    validateObjectId,
    filterDataByRole('Transaction'), // Ensure user has access to this specific transaction
    getContribution // REMOVED asyncHandler wrapper
  )
  .put(
    validateObjectId,
    authorize('admin', 'officer'), // Only Admin/Officer can update (non-financial fields)
    filterDataByRole('Transaction'), // Ensures they update an accessible transaction
    updateContribution // REMOVED asyncHandler wrapper
  )
  .delete(
    validateObjectId,
    authorize('admin', 'officer'), // Only Admin/Officer can soft-delete (requires reversal)
    filterDataByRole('Transaction'), // Ensures they delete an accessible transaction
    deleteContribution // REMOVED asyncHandler wrapper
  );

module.exports = router;
