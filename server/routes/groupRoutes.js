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
router.use(protect); // Enable authentication

// Test endpoint to check authentication
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Authentication test',
  });
});

router
  .route('/')
  .post(createGroup) // Temporarily remove validation to debug
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
