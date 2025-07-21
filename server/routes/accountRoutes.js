const express = require("express");
const router = express.Router();
const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Account routes - all protected
router.use(protect);

router
  .route("/")
  .post(validateRequiredFields(["owner", "ownerModel"]), createAccount)
  .get(getAccounts);

router
  .route("/:id")
  .get(validateObjectId, getAccountById)
  .put(validateObjectId, updateAccount)
  .delete(validateObjectId, deleteAccount);

module.exports = router;
