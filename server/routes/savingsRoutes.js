const express = require("express");
const router = express.Router();
const {
  createSavings,
  getSavings,
  getSavingsById,
  updateSavings,
  deleteSavings,
} = require("../controllers/savingsController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Savings routes - all protected
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields(["member", "memberModel", "amount"]),
    createSavings
  )
  .get(getSavings);

router
  .route("/:id")
  .get(validateObjectId, getSavingsById)
  .put(validateObjectId, updateSavings)
  .delete(validateObjectId, deleteSavings);

module.exports = router;
