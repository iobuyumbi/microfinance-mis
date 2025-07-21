const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Transaction routes - all protected
router.use(protect);

router
  .route("/")
  .post(validateRequiredFields(["type", "amount"]), createTransaction)
  .get(getTransactions);

router
  .route("/:id")
  .get(validateObjectId, getTransactionById)
  .put(validateObjectId, updateTransaction)
  .delete(validateObjectId, deleteTransaction);

module.exports = router;
