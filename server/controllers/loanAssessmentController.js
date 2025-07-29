// server\controllers\loanAssessmentController.js
const LoanAssessment = require('../models/LoanAssessment');
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account'); // To fetch savings balances from user/group accounts
const UserGroupMembership = require('../models/UserGroupMembership'); // To verify member-group relationship

const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

// Helper to get account balance
const getAccountBalance = async (ownerId, ownerModel, accountType) => {
  const account = await Account.findOne({
    owner: ownerId,
    ownerModel: ownerModel,
    type: accountType,
    status: 'active',
  });
  return account ? account.balance : 0;
};

// @desc    Create a new loan assessment
// @route   POST /api/loanassessments
// @access  Private (Admin, Officer, or user with 'can_create_loan_assessment' permission)
exports.createAssessment = asyncHandler(async (req, res, next) => {
  // Access control for 'can_create_loan_assessment' will be handled by middleware
  const {
    memberId,
    groupId,
    assessmentRules,
    notes,
    recommendedAmount,
    eligible,
  } = req.body;

  // 1. Validate input IDs
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  // 2. Validate member and group existence
  const member = await User.findById(memberId);
  if (!member) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // 3. Verify member belongs to the group using UserGroupMembership
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
  }

  // 4. Get member's individual savings balance from their personal savings account
  const individualSavings = await getAccountBalance(
    memberId,
    'User',
    'savings'
  );

  // 5. Get group's total savings/loan fund balance from the group's account
  const groupTotalSavings =
    (await getAccountBalance(groupId, 'Group', 'loan_fund')) ||
    (await getAccountBalance(groupId, 'Group', 'savings'));

  // 6. Create assessment
  const assessment = await LoanAssessment.create({
    member: memberId,
    group: groupId,
    assessedBy: req.user.id, // Authenticated user
    individualSavings,
    groupTotalSavings,
    assessmentRules: assessmentRules || {}, // Rules used for this assessment
    notes,
    recommendedAmount: recommendedAmount || 0, // Should be calculated or provided
    eligible: eligible !== undefined ? eligible : false, // Should be calculated or provided
    status: 'pending', // Default status for new assessment
  });

  res.status(201).json({
    success: true,
    message: 'Loan assessment created successfully.',
    data: assessment,
  });
});

// @desc    Get all assessments (filtered by role and query params)
// @route   GET /api/loanassessments
// @access  Private (filterDataByRole middleware handles access)
exports.getAssessments = asyncHandler(async (req, res, next) => {
  const { memberId, groupId, status } = req.query;

  let filter = req.dataFilter || {}; // Use filter from middleware

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
// @route   GET /api/loanassessments/:id
// @access  Private (authorizeAssessmentAccess middleware handles access)
exports.getAssessmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Assessment ID format.', 400));
  }

  const assessment = await LoanAssessment.findById(id)
    .populate('member', 'name email role status')
    .populate('group', 'name location')
    .populate('assessedBy', 'name email');

  if (!assessment) {
    return next(new ErrorResponse('Assessment not found.', 404));
  }

  // Access check is handled by authorizeAssessmentAccess middleware before this controller runs
  res.status(200).json({
    success: true,
    data: assessment,
  });
});

// @desc    Update assessment status
// @route   PUT /api/loanassessments/:id/status
// @access  Private (Admin, Officer, or user with 'can_update_loan_assessment_status' permission)
exports.updateAssessmentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Assessment ID format.', 400));
  }

  const assessment = await LoanAssessment.findById(id);
  if (!assessment) {
    return next(new ErrorResponse('Assessment not found.', 404));
  }

  // Basic validation for status
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
  await assessment.save();

  res.status(200).json({
    success: true,
    message: 'Assessment status updated successfully.',
    data: assessment,
  });
});

// @desc    Get loan assessment statistics
// @route   GET /api/loanassessments/stats
// @access  Private (filterDataByRole middleware handles access)
exports.getAssessmentStats = asyncHandler(async (req, res, next) => {
  const { groupId } = req.query;
  let filter = req.dataFilter || {}; // Use filter from middleware

  if (groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId))
      return next(new ErrorResponse('Invalid Group ID format.', 400));
    filter.group = groupId;
  }

  const assessments = await LoanAssessment.find(filter);

  const stats = {
    total: assessments.length,
    eligible: assessments.filter(a => a.eligible).length,
    ineligible: assessments.filter(a => !a.eligible).length,
    pending: assessments.filter(a => a.status === 'pending').length,
    approved: assessments.filter(a => a.status === 'approved').length,
    rejected: assessments.filter(a => a.filter === 'rejected').length, // Corrected from a.status
    expired: assessments.filter(a => a.status === 'expired').length,
    averageRecommendedAmount: 0,
    averageIndividualSavings: 0,
    averageGroupSavings: 0,
  };

  if (assessments.length > 0) {
    const eligibleAssessments = assessments.filter(a => a.eligible);
    stats.averageRecommendedAmount =
      eligibleAssessments.length > 0
        ? eligibleAssessments.reduce(
            (sum, a) => sum + (a.recommendedAmount || 0),
            0
          ) / eligibleAssessments.length
        : 0;
    stats.averageIndividualSavings =
      assessments.reduce((sum, a) => sum + a.individualSavings, 0) /
      assessments.length;
    stats.averageGroupSavings =
      assessments.reduce((sum, a) => sum + a.groupTotalSavings, 0) /
      assessments.length;
  }

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Perform a quick loan assessment (real-time calculation without saving)
// @route   GET /api/loanassessments/quick
// @access  Private (Admin, Officer, or user with 'can_perform_quick_assessment' permission)
exports.quickAssessment = asyncHandler(async (req, res, next) => {
  const { memberId, groupId } = req.query;

  // 1. Validate input IDs
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return next(new ErrorResponse('Invalid Member ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return next(new ErrorResponse('Invalid Group ID format.', 400));
  }

  // 2. Validate member and group existence
  const member = await User.findById(memberId);
  if (!member) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return next(new ErrorResponse('Group not found.', 404));
  }

  // 3. Verify member belongs to the group using UserGroupMembership
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
  }

  // 4. Get member's individual savings balance
  const individualSavings = await getAccountBalance(
    memberId,
    'User',
    'savings'
  );

  // 5. Get group's total savings/loan fund balance
  const groupTotalSavings =
    (await getAccountBalance(groupId, 'Group', 'loan_fund')) ||
    (await getAccountBalance(groupId, 'Group', 'savings'));

  // 6. Define default assessment rules (these could come from a SystemSettings model)
  const defaultRules = {
    minGroupSavings: 1000,
    minIndividualSavings: 200,
    maxLoanToGroupSavingsRatio: 0.3, // 30% of group savings
    maxLoanToIndividualSavingsRatio: 2, // 2x individual savings
    minLoanAmount: 500,
    maxLoanAmount: 10000,
  };

  // 7. Calculate assessment results
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
  }
  // Add more rules as needed, e.g., repayment history, existing loans, etc.

  const eligible =
    reasons.length === 0 && maxEligibleAmount >= defaultRules.minLoanAmount;
  // Recommended amount logic can be more complex, e.g., a percentage of maxEligibleAmount
  const recommendedAmount = eligible
    ? Math.min(maxEligibleAmount, defaultRules.maxLoanAmount)
    : 0;

  // Determine risk level based on various factors
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
