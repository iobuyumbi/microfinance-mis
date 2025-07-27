const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserRoleStatus,
  deleteUser,
} = require('../controllers/userController');
const { getUserGroups } = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// User routes - all protected
router.use(protect);

router.route('/').get(getAllUsers);

router
  .route('/profile')
  .put(validateRequiredFields(['name']), updateUserProfile);

router
  .route('/:id')
  .get(validateObjectId, getUserById)
  .put(
    authorize('admin'),
    validateObjectId,
    validateRequiredFields(['role', 'status']),
    updateUserRoleStatus
  )
  .delete(authorize('admin'), validateObjectId, deleteUser);

// Get groups for a specific user
router.get('/:id/groups', validateObjectId, getUserGroups);

module.exports = router;
