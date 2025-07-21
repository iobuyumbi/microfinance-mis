const express = require("express");
const router = express.Router();
const {
  applyForLoan,
  getAllLoans,
  getLoanById,
  approveLoan,
  updateLoan,
  deleteLoan,
} = require("../controllers/loanController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Loan routes - all protected
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields([
      "borrower",
      "borrowerModel",
      "amountRequested",
      "loanTerm",
    ]),
    applyForLoan
  )
  .get(getAllLoans);

router
  .route("/:id")
  .get(validateObjectId, getLoanById)
  .put(validateObjectId, updateLoan)
  .delete(authorize("admin", "officer"), validateObjectId, deleteLoan);

router
  .route("/:id/approve")
  .put(
    authorize("admin", "officer"),
    validateObjectId,
    validateRequiredFields(["status", "amountApproved"]),
    approveLoan
  );

module.exports = router;
