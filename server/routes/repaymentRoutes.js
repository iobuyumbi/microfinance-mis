// server\routes\repaymentRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  recordRepayment,
  getAllRepayments,
  getRepaymentsByLoan,
  getRepaymentById,
  voidRepayment, // Renamed from deleteRepayment
} = require('../controllers/repaymentController'); // Ensure controller is updated
const {
  protect,
  authorize,
  filterDataByRole,
  authorizeLoanAccess, // New middleware for loan-specific access
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// @route   POST /api/repayments
// @desc    Record a new loan repayment
// @access  Private (Admin, Officer, or user with 'can_record_repayments' permission for the specific loan/borrower)
router.post(
  '/',
  validateRequiredFields(['loanId', 'amountPaid']),
  // Authorization: Admin/Officer can record any repayment.
  // A leader can record repayments for loans within their group.
  // A member might record their own repayment.
  authorize('admin', 'officer', 'leader', 'member'), // Broad roles, controller/middleware will refine
  // You might add a custom middleware here to ensure the user has permission to record for this specific loan/borrower
  // e.g., authorizeLoanAccess('loanId', 'write')
  recordRepayment
);

// @route   GET /api/repayments
// @desc    Get all loan repayments (filtered by user's access)
// @access  Private (filterDataByRole middleware handles access)
router.get(
  '/',
  filterDataByRole('Transaction', 'loan_repayment'), // Filter for 'loan_repayment' type transactions
  getAllRepayments
);

// @route   GET /api/repayments/:id
// @desc    Get a specific repayment by Transaction ID
// @access  Private (filterDataByRole middleware handles access via associated loan)
router.get(
  '/:id',
  validateObjectId,
  filterDataByRole('Transaction', 'loan_repayment'), // Filter for 'loan_repayment' type transactions
  getRepaymentById
);

// @route   PUT /api/repayments/:id/void
// @desc    Void/Adjust a repayment (instead of deleting)
// @access  Private (Admin, Officer, or user with 'can_void_repayments' permission)
router.put(
  // Changed from DELETE to PUT
  '/:id/void', // Specific endpoint for voiding
  authorize('admin', 'officer'), // Only Admin/Officer can void repayments
  validateObjectId,
  validateRequiredFields(['reason']), // Reason is crucial for voiding
  voidRepayment
);

// @route   GET /api/repayments/loan/:loanId
// @desc    Get all repayments for a specific loan
// @access  Private (authorizeLoanAccess middleware handles access)
router.get(
  '/loan/:loanId',
  validateObjectId,
  authorizeLoanAccess('loanId'), // Ensure user has access to the loan itself
  getRepaymentsByLoan
);

module.exports = router;
