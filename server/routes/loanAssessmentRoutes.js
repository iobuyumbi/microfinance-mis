const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessmentStatus,
  getAssessmentStats,
  quickAssessment,
} = require('../controllers/loanAssessmentController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// All routes are protected
router.use(protect);

// Create new assessment (officers and admins only)
router.post(
  '/',
  authorize('officer', 'admin'),
  validateRequiredFields(['memberId', 'groupId']),
  createAssessment
);

// Get assessments (filtered by role)
router.get('/', getAssessments);

// Get assessment statistics
router.get('/stats', getAssessmentStats);

// Quick assessment (officers and admins only)
router.get(
  '/quick',
  authorize('officer', 'admin'),
  validateRequiredFields(['memberId', 'groupId']),
  quickAssessment
);

// Get specific assessment
router.get('/:id', validateObjectId, getAssessmentById);

// Update assessment status (officers and admins only)
router.put(
  '/:id/status',
  authorize('officer', 'admin'),
  validateObjectId,
  validateRequiredFields(['status']),
  updateAssessmentStatus
);

module.exports = router;
