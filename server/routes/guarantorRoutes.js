// server\routes\guarantorRoutes.js
const express = require('express');
const router = express.Router();
const {
  createGuarantor,
  getGuarantors,
  getGuarantorById,
  updateGuarantor,
  deleteGuarantor, // Now performs soft delete/revoke
} = require('../controllers/guarantorController'); // Ensure controller is updated
const {
  protect,
  authorize,
  filterDataByRole,
  authorizeOwnerOrAdmin, // For guarantor themselves
  authorizeLoanAccess, // For access based on associated loan
} = require('../middleware/auth'); // Import necessary auth middleware
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// @route   POST /api/guarantors
// @desc    Create a new guarantor entry for a loan
// @access  Private (Admin, Officer, or Loan Borrower/Group Leader if they have 'can_request_guarantee' or similar)
router.post(
  '/',
  validateRequiredFields(['loan', 'guarantor', 'amountGuaranteed']),
  // Authorization:
  // 1. Admin/Officer can create any guarantor.
  // 2. A user can create a guarantor record for a loan they are the borrower of (or their group is).
  // 3. A user can create a guarantor record for *themselves* as a guarantor.
  // This requires a custom authorization or a combination.
  // For simplicity, let's start with Admin/Officer and then add more granular.
  authorize('admin', 'officer'), // Only Admin/Officer can create guarantor records for now.
  // If members can add themselves as guarantors, or borrowers can add guarantors,
  // more complex logic is needed here or in controller.
  createGuarantor
);

// @route   GET /api/guarantors
// @desc    Get all guarantor entries (filtered by user's access)
// @access  Private (Admin/Officer see all; others see guarantors for loans they are involved with or where they are the guarantor)
router.get(
  '/',
  filterDataByRole('Guarantor'), // Filter based on user's role and associated loans/groups
  getGuarantors
);

// @route   GET /api/guarantors/:id
// @desc    Get a single guarantor entry by ID
// @access  Private (Admin/Officer; or if user is the guarantor; or if user is borrower/leader of associated loan)
router.get(
  '/:id',
  validateObjectId,
  // This needs a specific authorization.
  // authorizeOwnerOrAdmin could be used if 'guarantor' field is the owner.
  // Or a custom middleware that checks req.user._id against guarantor.guarantor OR guarantor.loan.borrower
  // For now, rely on `filterDataByRole` which will be applied by the controller's `findOne(query)`
  filterDataByRole('Guarantor'), // Ensure access based on role
  getGuarantorById
);

// @route   PUT /api/guarantors/:id
// @desc    Update a guarantor entry (e.g., change status, amount)
// @access  Private (Admin, Officer, or specific 'can_approve_guarantors' permission)
router.put(
  '/:id',
  validateObjectId,
  // Authorization: Approving/rejecting a guarantor is a privileged action.
  // A group leader might approve guarantors for their group's loans.
  authorize('admin', 'officer'), // Only Admin/Officer can update guarantor records for now.
  // If group leaders can approve, add 'leader' and use authorizeGroupPermission.
  updateGuarantor
);

// @route   DELETE /api/guarantors/:id
// @desc    Soft delete (revoke/inactivate) a guarantor entry
// @access  Private (Admin, Officer, or specific 'can_manage_guarantors' permission)
router.delete(
  '/:id',
  validateObjectId,
  authorize('admin', 'officer'), // Only Admin/Officer can revoke/soft delete guarantor records.
  deleteGuarantor
);

module.exports = router;
