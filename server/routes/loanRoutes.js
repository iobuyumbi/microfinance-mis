// server\routes\loanRoutes.js
const express = require('express');
const router = express.Router();
const {
  applyForLoan,
  getAllLoans,
  getLoanById,
  approveLoan,
  updateLoan,
  deleteLoan,
} = require('../controllers/loanController');
const {
  protect,
  authorize,
  filterDataByRole,
  // Add custom authorization for applyForLoan and updateLoan if needed
  // For simplicity, we'll rely on filterDataByRole where possible and specific authorize for privileged actions.
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// @route   POST /api/loans
// @desc    Apply for a loan
// @access  Private (Member for self, Leader/Officer for group/members within their scope)
// The 'authorize' middleware needs to be flexible here.
// For now, allow protected users to apply, and controller/filter will validate context.
// A more advanced approach would be to add a middleware that checks if req.user can apply for the specified 'borrower'.
router.post(
  '/',
  // No specific 'authorize' here for roles like admin/officer,
  // as members also apply. The 'filterDataByRole' for Loan model,
  // combined with the borrower verification in the controller,
  // provides the necessary access control for creating a loan application.
  // If you need to restrict who can 'initiate' a loan request beyond
  // just being a user, you'd add a custom middleware here.
  validateRequiredFields([
    'borrower',
    'borrowerModel',
    'amountRequested',
    'loanTerm',
  ]),
  applyForLoan
);

// @route   GET /api/loans
// @desc    Get all loans (filtered by user's access)
// @access  Private (filterDataByRole middleware handles access)
router.get(
  '/',
  filterDataByRole('Loan'), // Apply data filtering based on user role/group membership
  getAllLoans
);

// @route   GET /api/loans/:id
// @desc    Get a single loan by ID with access control
// @access  Private (filterDataByRole middleware handles access)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Loan'), // Ensure user can only view loans they are authorized for
  getLoanById
);

// @route   PUT /api/loans/:id
// @desc    Update loan request (only pending + access-controlled by filterDataByRole)
// @access  Private (Borrower or Admin/Officer for loans they can access)
router.put(
  '/:id',
  validateObjectId,
  filterDataByRole('Loan'), // Ensure user can only update loans they are authorized for
  updateLoan
);

// @route   PUT /api/loans/:id/approve
// @desc    Approve or update loan status/schedule
// @access  Private (Admin, Officer) - only these roles can approve loans
router.put(
  '/:id/approve',
  authorize('admin', 'officer'), // Only Admin and Officers can approve
  validateObjectId,
  validateRequiredFields(['status', 'amountApproved']),
  approveLoan
);

// @route   DELETE /api/loans/:id
// @desc    Delete a loan (soft delete recommended for financial records)
// @access  Private (Admin, Officer) - or loan creator if pending via filterDataByRole
router.delete(
  '/:id',
  authorize('admin', 'officer'), // Admins/Officers can delete.
  // If a borrower should be able to delete their *pending* loan,
  // you'd add another middleware like authorizeOwnerOrAdmin or filterDataByRole('Loan')
  // and then handle the `status` check in the controller.
  validateObjectId,
  deleteLoan
);

module.exports = router;
