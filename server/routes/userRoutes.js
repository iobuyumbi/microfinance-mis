const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  updateUserRoleStatus,
  deleteUser,
  getUserGroups,
  getGroupMembers,
  updateGroupMemberRole,
  updateGroupMemberStatus,
  addMemberToGroup,
  removeMemberFromGroup,
  getUserFinancialSummary,
} = require('../controllers/userController');
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

// Get user's financial summary
router.get('/:id/financial-summary', validateObjectId, getUserFinancialSummary);

// Group member management routes
router.get('/groups/:groupId/members', validateObjectId, getGroupMembers);
router.put(
  '/groups/:groupId/members/:memberId/role',
  validateObjectId,
  updateGroupMemberRole
);
router.put(
  '/groups/:groupId/members/:memberId/status',
  validateObjectId,
  updateGroupMemberStatus
);
router.post('/groups/:groupId/members', validateObjectId, addMemberToGroup);
router.delete(
  '/groups/:groupId/members/:memberId',
  validateObjectId,
  removeMemberFromGroup
);

module.exports = router;
