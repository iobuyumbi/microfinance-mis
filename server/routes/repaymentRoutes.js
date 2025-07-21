const express = require("express");
const router = express.Router();
const {
  recordRepayment,
  getAllRepayments,
  getRepaymentsByLoan,
  getRepaymentById,
  deleteRepayment,
} = require("../controllers/repaymentController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Repayment routes - all protected
router.use(protect);

router
  .route("/")
  .post(validateRequiredFields(["loanId", "amountPaid"]), recordRepayment)
  .get(getAllRepayments);

router
  .route("/:id")
  .get(validateObjectId, getRepaymentById)
  .delete(authorize("admin", "officer"), validateObjectId, deleteRepayment);

router.get("/loan/:loanId", validateObjectId, getRepaymentsByLoan);

module.exports = router;
