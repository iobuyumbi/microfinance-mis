// server\routes\loanAssessmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessmentStatus,
  getAssessmentStats,
  quickAssessment,
} = require('../controllers/loanAssessmentController'); // Assuming this controller exists and is refactored
const {
  protect,
  authorize,
  filterDataByRole,
  authorizeOwnerOrAdmin, // For personal assessments
  authorizeGroupAccess, // For group-related assessments
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

// @route   POST /api/loan-assessments
// @desc    Create a new loan assessment
// @access  Private (Admin, Officer)
router.post(
  '/',
  authorize('admin', 'officer'), // Only Admin and Officers can create assessments
  validateRequiredFields(['memberId', 'groupId']), // memberId and groupId are crucial for context
  createAssessment
);

// @route   GET /api/loan-assessments
// @desc    Get all loan assessments (filtered by user's access)
// @access  Private (Admin/Officer see all, Leaders see their group's, Members see their own)
router.get(
  '/',
  filterDataByRole('LoanAssessment'), // Apply data filtering based on user role/group membership
  getAssessments
);

// @route   GET /api/loan-assessments/stats
// @desc    Get loan assessment statistics
// @access  Private (Admin, Officer, Leader - for their group's stats)
router.get(
  '/stats',
  authorize('admin', 'officer', 'leader'), // Leaders can see stats for their group
  // The controller `getAssessmentStats` should internally use `req.dataFilter`
  // to ensure the stats are relevant to the user's access scope.
  filterDataByRole('LoanAssessment'), // Ensure data filter is applied for stats calculation
  getAssessmentStats
);

// @route   GET /api/loan-assessments/quick
// @desc    Perform a quick loan assessment (e.g., eligibility check without full record)
// @access  Private (Admin, Officer)
router.get(
  '/quick',
  authorize('admin', 'officer'), // Only Admin and Officers can perform quick assessments
  validateRequiredFields(['memberId', 'groupId']), // Requires context for the assessment
  quickAssessment
);

// @route   GET /api/loan-assessments/:id
// @desc    Get a specific loan assessment by ID
// @access  Private (Admin, Officer, or if user is the assessed member/leader of the assessed group)
router.get(
  '/:id',
  validateObjectId,
  // This needs a specific authorization.
  // Assuming LoanAssessment model has 'member' and/or 'group' fields.
  // If it has 'member' field, authorizeOwnerOrAdmin('member') can work.
  // If it has 'group' field, authorizeGroupAccess('group') can work.
  // For comprehensive access, the controller should use req.dataFilter.
  filterDataByRole('LoanAssessment'), // Ensure access based on role
  getAssessmentById
);

// @route   PUT /api/loan-assessments/:id/status
// @desc    Update a loan assessment's status (e.g., 'approved', 'rejected')
// @access  Private (Admin, Officer)
router.put(
  '/:id/status',
  authorize('admin', 'officer'), // Only Admin and Officers can update assessment status
  validateObjectId,
  validateRequiredFields(['status']),
  updateAssessmentStatus
);

module.exports = router;
