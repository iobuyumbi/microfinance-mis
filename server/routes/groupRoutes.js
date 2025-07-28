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
// Chat functionality is handled by separate chat routes

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

// Join group route
router.post('/:id/join', validateObjectId, async (req, res, next) => {
  try {
    const group = await require('../models/Group').findById(req.params.id);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    }

    // Add the current user to the group
    if (group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'User is already a member of this group',
        });
    }

    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the group',
      data: group,
    });
  } catch (error) {
    next(error);
  }
});

// Group chat functionality is handled by /api/chat routes

module.exports = router;
