// server\routes\transactionRoutes.js (REVISED)
const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} = require('../controllers/transactionController');
const { protect, authorize, filterDataByRole } = require('../middleware/auth');
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');

// All transaction routes are protected
router.use(protect);

router
  .route('/')
  .post(
    validateRequiredFields(['type', 'amount', 'member', 'group', 'account']), // Added required fields for general transaction
    authorize('admin', 'officer'), // Only admin/officer can create general transactions
    createTransaction
  )
  .get(
    filterDataByRole('Transaction'), // Filters all transactions based on user's role and access
    getTransactions
  );

// Stats route should be defined before parameterized routes
router
  .route('/stats')
  .get(filterDataByRole('Transaction'), getTransactionStats);

router
  .route('/:id')
  .get(
    validateObjectId,
    filterDataByRole('Transaction'), // Ensures user can only view accessible transactions
    getTransactionById
  )
  .put(
    validateObjectId,
    authorize('admin', 'officer'), // Only admin/officer can update transactions (for non-financial fields)
    filterDataByRole('Transaction'), // Ensures admin/officer operates on accessible data
    updateTransaction
  )
  .delete(
    validateObjectId,
    authorize('admin', 'officer'), // Only admin/officer can soft-delete transactions
    filterDataByRole('Transaction'), // Ensures admin/officer operates on accessible data
    deleteTransaction
  );

module.exports = router;
