// server\routes\userRoutes.js (REVISED)
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
const {
    protect,
    authorize
} = require('../middleware/auth');
const {
    authorizeRoles,
    authorizeGroupAccess,
    authorizeOwnerOrAdmin,
    authorizeGroupPermission,
    filterDataByRole
} = require('../middleware/rbac');
const { validateObjectId, validateRequiredFields } = require('../middleware/validate');

// User routes - all protected
router.use(protect);

// Get all users - role-based filtering applied in controller
router.route('/').get(filterDataByRole('User'), getAllUsers); // Specify model type for filterDataByRole

// Profile management - users can update their own profile
router
    .route('/profile')
    .put(validateRequiredFields(['name']), updateUserProfile); // 'name' as a mandatory field for profile update

// User management by ID
router
    .route('/:id')
    .get(validateObjectId, authorizeOwnerOrAdmin('id'), getUserById)
    .put(
        authorizeRoles('admin', 'officer'),
        validateObjectId,
        // Removed validateRequiredFields(['role', 'status']) here to allow partial updates.
        // Validation for content of role/status is in the controller.
        updateUserRoleStatus
    )
    .delete(authorizeRoles('admin'), validateObjectId, deleteUser);

// Get groups for a specific user - owner or admin only
router.get('/:id/groups', validateObjectId, authorizeOwnerOrAdmin('id'), getUserGroups);

// Get user's financial summary - owner or admin only
router.get('/:id/financial-summary', validateObjectId, authorizeOwnerOrAdmin('id'), getUserFinancialSummary);

// Group member management routes with proper RBAC
router.get('/groups/:groupId/members',
    validateObjectId,
    authorizeGroupAccess('groupId'),
    getGroupMembers
);

router.put(
    '/groups/:groupId/members/:memberId/role',
    validateObjectId,
    authorizeGroupPermission('can_manage_members', 'groupId'),
    updateGroupMemberRole
);

router.put(
    '/groups/:groupId/members/:memberId/status',
    validateObjectId,
    authorizeGroupPermission('can_manage_members', 'groupId'),
    updateGroupMemberStatus
);

router.post('/groups/:groupId/members',
    validateObjectId,
    authorizeGroupPermission('can_manage_members', 'groupId'),
    addMemberToGroup
);

router.delete(
    '/groups/:groupId/members/:memberId',
    validateObjectId,
    authorizeGroupPermission('can_manage_members', 'groupId'),
    removeMemberFromGroup
);

module.exports = router;