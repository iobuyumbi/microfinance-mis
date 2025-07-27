const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
} = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/auth'); // Ensure these are imported
const {
  validateObjectId,
  validateRequiredFields,
} = require('../middleware/validate');
const chatController = require('../controllers/chatController');

// Group routes - all protected
// router.use(protect); // <--- TEMPORARILY COMMENTED OUT FOR DEBUGGING

router
  .route('/')
  .post(validateRequiredFields(['name']), createGroup)
  .get(getAllGroups); // This route is now protected again by router.use(protect)

router
  .route('/:id')
  .get(validateObjectId, getGroupById)
  .put(validateObjectId, validateRequiredFields(['name']), updateGroup)
  .delete(validateObjectId, deleteGroup);

router
  .route('/:id/members')
  .post(validateObjectId, validateRequiredFields(['userId']), addMember)
  .delete(validateObjectId, validateRequiredFields(['userId']), removeMember);

// Group chat routes
router
  .route('/:groupId/chats')
  .get(chatController.getGroupChats)
  .post(chatController.postGroupChat);

module.exports = router;
