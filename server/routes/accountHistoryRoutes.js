const express = require("express");
const router = express.Router();
const {
  createAccountHistory,
  getAccountHistories,
  getAccountHistoryById,
  updateAccountHistory,
  deleteAccountHistory,
} = require("../controllers/accountHistoryController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Account History routes - all protected
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields([
      "account",
      "transactionType",
      "amount",
      "balanceAfter",
    ]),
    createAccountHistory
  )
  .get(getAccountHistories);

router
  .route("/:id")
  .get(validateObjectId, getAccountHistoryById)
  .put(validateObjectId, updateAccountHistory)
  .delete(validateObjectId, deleteAccountHistory);

module.exports = router;
