// server\routes\accountRoutes.js (UPDATED for Leader Account Manipulation)
const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');
const {
  protect,
  authorize, // For roles like 'admin', 'officer' directly
  filterDataByRole, // For GET all accounts
  authorizeOwnerOrAdmin, // For GET/PUT by ID, checking ownership or admin/officer/leader for group accounts
} = require('../middleware/auth');
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
  // @access  Private (Admin, Officer) - remains restricted for now
  .post(
    authorize('admin', 'officer'),
    validateRequiredFields(['owner', 'ownerModel', 'type']),
    createAccount
  )
  // @route   GET /api/accounts
  // @desc    Get all accounts (filtered by role)
  // @access  Private (Admin/Officer see all, Leaders see group accounts, Members see their own)
  .get(filterDataByRole('Account'), getAccounts);

router
  .route('/:id')
  // @route   GET /api/accounts/:id
  // @desc    Get a single account by ID
  // @access  Private (Owner, Admin, Officer, Group Leader if group account)
  .get(
    validateObjectId,
    // authorizeOwnerOrAdmin needs to handle user ownership, admin/officer roles,
    // and group leader access for group-owned accounts.
    authorizeOwnerOrAdmin('Account', 'owner'),
    getAccountById
  )
  // @route   PUT /api/accounts/:id
  // @desc    Update account metadata (e.g., name, description, but NOT balance or type)
  // @access  Private (Admin, Officer, or Group Leader for group accounts)
  .put(
    validateObjectId,
    // Now, authorizeOwnerOrAdmin is used here.
    // It must contain the logic to allow admins, officers,
    // AND leaders of the owning group to update.
    authorizeOwnerOrAdmin('Account', 'owner'),
    updateAccount
  )
  // @route   DELETE /api/accounts/:id
  // @desc    Delete an account (consider soft delete in controller)
  // @access  Private (Admin only)
  .delete(
    validateObjectId,
    authorize('admin'), // Deletion remains admin-only
    deleteAccount
  );

module.exports = router;
