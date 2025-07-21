const express = require("express");
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} = require("../controllers/groupController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateObjectId,
  validateRequiredFields,
} = require("../middleware/validate");

// Group routes - all protected
router.use(protect);

router
  .route("/")
  .post(validateRequiredFields(["name"]), createGroup)
  .get(getAllGroups);

router
  .route("/:id")
  .get(validateObjectId, getGroupById)
  .put(validateObjectId, validateRequiredFields(["name"]), updateGroup)
  .delete(validateObjectId, deleteGroup);

router
  .route("/:id/members")
  .post(validateObjectId, validateRequiredFields(["userId"]), addMember)
  .delete(validateObjectId, validateRequiredFields(["userId"]), removeMember);

module.exports = router;
