// server\controllers\loanAssessmentController.js
const LoanAssessment = require('../models/LoanAssessment');
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account'); // To fetch savings balances from user/group accounts
const UserGroupMembership = require('../models/UserGroupMembership'); // To verify member-group relationship

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse, settingsHelper } = require('../utils'); // Import custom error class and settingsHelper
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get account balance
const getAccountBalance = async (ownerId, ownerModel, accountType) => {
  const account = await Account.findOne({
    owner: ownerId,
    ownerModel,
    type: accountType,
    status: 'active',
  });
  return account ? account.balance : 0;
};

// @desc    Create a new loan assessment
// @route   POST /api/loan-assessments
// @access  Private (Admin, Officer)
exports.createAssessment = asyncHandler(async (req, res, next) => {
  const {
    memberId,
    groupId,
    assessmentRules,
    notes, // REMOVED: recommendedAmount, eligible - these are calculated by the model's pre('save') hook
  } = req.body; // 1. Validate input IDs (already handled by validateRequiredFields and middleware, but good for specific type checks)

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  } // 2. Validate member and group existence

  const member = await User.findById(memberId);
  if (!member) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  } // 3. Verify member belongs to the group using UserGroupMembership

  const isMemberOfGroup = await UserGroupMembership.findOne({
    user: memberId,
    group: groupId,
    status: 'active', // Ensure the membership is active
  });
  if (!isMemberOfGroup) {
    return next(
      new ErrorResponse(
        'Member does not belong to this group or is not an active member.',
        400
      )
    );
  } // 4. Get member's individual savings balance from their personal savings account

  const individualSavings = await getAccountBalance(
    memberId,
    'User',
    'savings'
  ); // 5. Get group's total savings/loan fund balance from the group's account

  const groupTotalSavings =
    (await getAccountBalance(groupId, 'Group', 'loan_fund')) ||
    (await getAccountBalance(groupId, 'Group', 'savings')); // 6. Create assessment

  const assessment = await LoanAssessment.create({
    member: memberId,
    group: groupId,
    assessedBy: req.user.id, // Authenticated user from protect middleware
    individualSavings,
    groupTotalSavings,
    assessmentRules: assessmentRules || {}, // Rules used for this assessment. If empty, model defaults apply.
    notes, // These fields will be calculated by the pre('save') hook in the LoanAssessment model
    // recommendedAmount, eligible, maxEligibleAmount, riskLevel, reasons
    status: 'pending', // Default status for new assessment
  });

  res.status(201).json({
    success: true,
    message: 'Loan assessment created successfully.',
    data: assessment,
  });
});

// @desc    Get all assessments (filtered by role and query params)
// @route   GET /api/loan-assessments
// @access  Private (filterDataByRole middleware handles access)
exports.getAssessments = asyncHandler(async (req, res, next) => {
  const { memberId, groupId, status } = req.query;

  const filter = req.dataFilter || {}; // Use filter from filterDataByRole middleware
  // Apply additional query filters

  if (memberId) {
    if (!mongoose.Types.ObjectId.isValid(memberId))
      return next(new ErrorResponse('Invalid Member ID format.', 400));
    filter.member = memberId;
  }
  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId))
      return next(new ErrorResponse('Invalid Group ID format.', 400));
    filter.group = groupId;
  }
  if (status) filter.status = status;

  const assessments = await LoanAssessment.find(filter)
    .populate('member', 'name email')
    .populate('group', 'name')
    .populate('assessedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: assessments.length,
    data: assessments,
  });
});

// @desc    Get assessment by ID
// @route   GET /api/loan-assessments/:id
// @access  Private (filterDataByRole middleware handles access)
exports.getAssessmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Assessment ID format.', 400));
  } // Combine _id from params with req.dataFilter for robust access control

  const query = { _id: id, ...(req.dataFilter || {}) };

  const assessment = await LoanAssessment.findOne(query)
    .populate('member', 'name email role status')
    .populate('group', 'name location')
    .populate('assessedBy', 'name email');

  if (!assessment) {
    // If not found, it means either the ID is wrong, or the user doesn't have access
    return next(
      new ErrorResponse('Assessment not found or you do not have access.', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: assessment,
  });
});

// @desc    Update assessment status
// @route   PUT /api/loan-assessments/:id/status
// @access  Private (Admin, Officer)
exports.updateAssessmentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Assessment ID format.', 400));
  } // Fetch the assessment using a combined query to enforce data access rules

  const query = { _id: id, ...(req.dataFilter || {}) }; // Add req.dataFilter for consistency if it was passed
  let assessment = await LoanAssessment.findOne(query);

  if (!assessment) {
    return next(
      new ErrorResponse(
        'Assessment not found or you do not have permission to update.',
        404
      )
    );
  } // Basic validation for status

  const validStatuses = ['pending', 'approved', 'rejected', 'expired'];
  if (!status || !validStatuses.includes(status)) {
    return next(
      new ErrorResponse(
        `Invalid status provided. Must be one of: ${validStatuses.join(', ')}.`,
        400
      )
    );
  }

  assessment.status = status;
  await assessment.save(); // Re-populate for response if needed

  assessment = await LoanAssessment.findById(assessment._id)
    .populate('member', 'name email role status')
    .populate('group', 'name location')
    .populate('assessedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Assessment status updated successfully.',
    data: assessment,
  });
});

// @desc    Get loan assessment statistics
// @route   GET /api/loan-assessments/stats
// @access  Private (filterDataByRole middleware handles access)
exports.getAssessmentStats = asyncHandler(async (req, res, next) => {
  const { groupId } = req.query;
  const filter = req.dataFilter || {}; // Use filter from filterDataByRole middleware

  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId))
      return next(new ErrorResponse('Invalid Group ID format.', 400));
    filter.group = groupId;
  } // REMOVED: const assessments = await LoanAssessment.find(filter); // Old in-memory filtering

  const stats = await LoanAssessment.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        eligible: { $sum: { $cond: ['$eligible', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        totalRecommendedAmount: { $sum: '$recommendedAmount' },
        totalIndividualSavings: { $sum: '$individualSavings' },
        totalGroupSavings: { $sum: '$groupTotalSavings' },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        eligible: 1,
        ineligible: { $subtract: ['$total', '$eligible'] }, // Calculated directly
        pending: 1,
        approved: 1,
        rejected: 1,
        expired: 1,
        averageRecommendedAmount: {
          $cond: [
            { $gt: ['$eligible', 0] },
            { $divide: ['$totalRecommendedAmount', '$eligible'] },
            0,
          ],
        },
        averageIndividualSavings: {
          $cond: [
            { $gt: ['$total', 0] },
            { $divide: ['$totalIndividualSavings', '$total'] },
            0,
          ],
        },
        averageGroupSavings: {
          $cond: [
            { $gt: ['$total', 0] },
            { $divide: ['$totalGroupSavings', '$total'] },
            0,
          ],
        },
      },
    },
  ]); // Handle case where no documents match
  res.status(200).json({ success: true, data: stats[0] || {} }); // Ensure to return the first element or empty object
});

// @desc    Perform a quick loan assessment (real-time calculation without saving)
// @route   GET /api/loan-assessments/quick
// @access  Private (Admin, Officer)
exports.quickAssessment = asyncHandler(async (req, res, next) => {
  const { memberId, groupId } = req.query; // 1. Validate input IDs

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  } // 2. Validate member and group existence

  const member = await User.findById(memberId);
  if (!member) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  } // 3. Verify member belongs to the group using UserGroupMembership

  const isMemberOfGroup = await UserGroupMembership.findOne({
    user: memberId,
    group: groupId,
    status: 'active',
  });
  if (!isMemberOfGroup) {
    return next(
      new ErrorResponse(
        'Member does not belong to this group or is not an active member.',
        400
      )
    );
  } // 4. Get member's individual savings balance

  const individualSavings = await getAccountBalance(
    memberId,
    'User',
    'savings'
  ); // 5. Get group's total savings/loan fund balance

  const groupTotalSavings =
    (await getAccountBalance(groupId, 'Group', 'loan_fund')) ||
    (await getAccountBalance(groupId, 'Group', 'savings')); // 6. Define default assessment rules (fetch from settingsHelper)
  // Ensure your settingsHelper.getLoanAssessmentRules() returns an object like:
  // { minGroupSavings: ..., minIndividualSavings: ..., etc. }

  const defaultRules = await settingsHelper.getLoanAssessmentRules(); // 7. Calculate assessment results

  const maxFromGroupSavings =
    groupTotalSavings * defaultRules.maxLoanToGroupSavingsRatio;
  const maxFromIndividualSavings =
    individualSavings * defaultRules.maxLoanToIndividualSavingsRatio;
  const maxEligibleAmount = Math.min(
    maxFromGroupSavings,
    maxFromIndividualSavings,
    defaultRules.maxLoanAmount
  );

  const reasons = [];
  if (groupTotalSavings < defaultRules.minGroupSavings) {
    reasons.push(
      `Group savings (${groupTotalSavings}) is below minimum requirement (${defaultRules.minGroupSavings})`
    );
  }
  if (individualSavings < defaultRules.minIndividualSavings) {
    reasons.push(
      `Individual savings (${individualSavings}) is below minimum requirement (${defaultRules.minIndividualSavings})`
    );
  } // Add more rules as needed, e.g., repayment history, existing loans, etc.
  const eligible =
    reasons.length === 0 && maxEligibleAmount >= defaultRules.minLoanAmount; // Recommended amount logic can be more complex, e.g., a percentage of maxEligibleAmount
  const recommendedAmount = eligible
    ? Math.min(maxEligibleAmount, defaultRules.maxLoanAmount)
    : 0; // Determine risk level based on various factors

  let riskLevel = 'high';
  if (groupTotalSavings >= 5000 && individualSavings >= 1000 && eligible) {
    riskLevel = 'low';
  } else if (
    groupTotalSavings >= 2000 &&
    individualSavings >= 500 &&
    eligible
  ) {
    riskLevel = 'medium';
  }

  res.status(200).json({
    success: true,
    data: {
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
      },
      group: {
        _id: group._id,
        name: group.name,
      },
      individualSavings,
      groupTotalSavings,
      eligible,
      recommendedAmount,
      maxEligibleAmount,
      riskLevel,
      reasons,
      assessmentRules: defaultRules, // Return the rules used for transparency
    },
  });
});
