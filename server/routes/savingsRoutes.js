// server\routes\savingsRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSavings,
  getSavings,
  getSavingsById,
  updateSavings,
  deleteSavings,
  recordSavingsDeposit, // NEW
  recordSavingsWithdrawal, // NEW
  getSavingsAccountTransactions, // NEW
} = require('../controllers/savingsController');
const {
  protect,
  authorizeAccountAccess,
  filterDataByRole,
} = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// All savings routes are protected
router.use(protect);

router
  .route('/')
  .post(validateRequiredFields(['owner', 'ownerModel']), createSavings)
  .get(
    filterDataByRole('Account'), // Applies role-based filtering to returned accounts
    getSavings
  );

router
  .route('/deposit') // Route for recording a deposit into ANY savings account
  .post(
    validateRequiredFields(['accountId', 'amount']),
    // Authorization handled inside recordSavingsDeposit based on account owner/group permissions
    recordSavingsDeposit
  );

router
  .route('/withdraw') // Route for recording a withdrawal from ANY savings account
  .post(
    validateRequiredFields(['accountId', 'amount']),
    // Authorization handled inside recordSavingsWithdrawal
    recordSavingsWithdrawal
  );

router
  .route('/:id')
  .get(
    validateObjectId,
    authorizeAccountAccess(), // Ensures user has access to this specific account
    getSavingsById
  )
  .put(
    validateObjectId,
    authorizeAccountAccess(), // Ensures user has access to this specific account
    updateSavings
  )
  .delete(
    validateObjectId,
    authorizeAccountAccess(), // Ensures user has access to this specific account
    deleteSavings
  );

router
  .route('/:id/transactions') // Route to get transactions for a specific savings account
  .get(
    validateObjectId,
    authorizeAccountAccess(), // Ensures user has access to this specific account
    getSavingsAccountTransactions
  );

module.exports = router;
