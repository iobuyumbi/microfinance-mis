// server\routes\accountRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController'); // Assumed to exist and align with proposed roles
const {
  protect,
  authorize,
  filterDataByRole,
  authorizeOwnerOrAdmin,
} = require('../middleware/auth'); // Import new middlewares
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// Apply protection to all routes in this router
router.use(protect);

router
  .route('/')
  // @route   POST /api/accounts
  // @desc    Create a new account (e.g., a member's savings account, a group's fund)
  // @access  Private (Admin, Officer) - only privileged roles can create accounts
  .post(
    authorize('admin', 'officer'), // Only Admin/Officer can create new accounts
    validateRequiredFields(['owner', 'ownerModel', 'type']), // type is also required
    createAccount
  )
  // @route   GET /api/accounts
  // @desc    Get all accounts (filtered by role)
  // @access  Private (Admin/Officer see all, Leaders see group accounts, Members see their own)
  .get(filterDataByRole('Account'), getAccounts); // filterDataByRole handles access based on role

router
  .route('/:id')
  // @route   GET /api/accounts/:id
  // @desc    Get a single account by ID
  // @access  Private (Owner, Admin, Officer, Group Leader if group account)
  .get(
    validateObjectId,
    authorizeOwnerOrAdmin('Account', 'owner'), // Ensures owner or admin/officer access
    getAccountById
  )
  // @route   PUT /api/accounts/:id
  // @desc    Update account metadata (e.g., name, description, but NOT balance or type)
  // @access  Private (Admin, Officer, or Group Leader for group accounts)
  .put(
    validateObjectId,
    authorize('admin', 'officer', 'groupLeader-account'), // You'll need to define 'groupLeader-account' or a similar permission logic
    // within authorize that checks if req.user is leader of account's group.
    // For simplicity, for now, let's keep it just admin/officer.
    authorize('admin', 'officer'), // Only Admin/Officer can update accounts for now.
    // Group leaders would need more complex logic in authorize.
    updateAccount
  )
  // @route   DELETE /api/accounts/:id
  // @desc    Delete an account (consider soft delete in controller)
  // @access  Private (Admin only)
  .delete(
    validateObjectId,
    authorize('admin'), // Only Admin can delete accounts
    deleteAccount
  );

module.exports = router;
