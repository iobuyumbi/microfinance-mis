const express = require("express");
const router = express.Router();
const {
  createGuarantor,
  getGuarantors,
  getGuarantorById,
  updateGuarantor,
  deleteGuarantor,
} = require("../controllers/guarantorController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Guarantor routes - all protected
router.use(protect);

router
  .route("/")
  .post(
    validateRequiredFields(["loan", "guarantor", "amountGuaranteed"]),
    createGuarantor
  )
  .get(getGuarantors);

router
  .route("/:id")
  .get(validateObjectId, getGuarantorById)
  .put(validateObjectId, updateGuarantor)
  .delete(validateObjectId, deleteGuarantor);

module.exports = router;
