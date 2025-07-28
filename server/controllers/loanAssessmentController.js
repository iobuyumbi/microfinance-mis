const LoanAssessment = require('../models/LoanAssessment');
const User = require('../models/User');
const Group = require('../models/Group');
const Savings = require('../models/Savings');

// Create a new loan assessment
exports.createAssessment = async (req, res, next) => {
  try {
    const { memberId, groupId, assessmentRules, notes } = req.body;

    // Only officers and admins can create assessments
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only officers and admins can perform loan assessments',
      });
    }

    // Validate member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Validate group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if member belongs to the group
    if (!group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Member does not belong to this group',
      });
    }

    // Get member's individual savings
    const memberSavings = await Savings.find({ member: memberId });
    const individualSavings = memberSavings.reduce(
      (sum, saving) => sum + saving.amount,
      0
    );

    // Get group's total savings
    const groupSavings = await Savings.find({ group: groupId });
    const groupTotalSavings = groupSavings.reduce(
      (sum, saving) => sum + saving.amount,
      0
    );

    // Create assessment
    const assessment = new LoanAssessment({
      member: memberId,
      group: groupId,
      assessedBy: req.user.id,
      individualSavings,
      groupTotalSavings,
      assessmentRules: assessmentRules || {},
      notes,
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Loan assessment created successfully',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// Get all assessments (filtered by role)
exports.getAssessments = async (req, res, next) => {
  try {
    const { memberId, groupId, status } = req.query;
    const filter = {};

    // Apply filters
    if (memberId) filter.member = memberId;
    if (groupId) filter.group = groupId;
    if (status) filter.status = status;

    // Role-based filtering
    if (req.user.role === 'member') {
      // Members can only see their own assessments
      filter.member = req.user.id;
    } else if (req.user.role === 'leader') {
      // Leaders can see assessments for their groups
      const userGroups = await Group.find({
        $or: [{ members: req.user.id }, { createdBy: req.user.id }],
      });
      filter.group = { $in: userGroups.map(g => g._id) };
    }
    // Admins and officers can see all assessments

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
  } catch (error) {
    next(error);
  }
};

// Get assessment by ID
exports.getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await LoanAssessment.findById(req.params.id)
      .populate('member', 'name email role status')
      .populate('group', 'name location')
      .populate('assessedBy', 'name email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    // Check access permissions
    if (
      req.user.role === 'member' &&
      assessment.member._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (req.user.role === 'leader') {
      const userGroups = await Group.find({
        $or: [{ members: req.user.id }, { createdBy: req.user.id }],
      });
      const hasAccess = userGroups.some(
        g => g._id.toString() === assessment.group._id.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// Update assessment status
exports.updateAssessmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Only officers and admins can update assessment status
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only officers and admins can update assessment status',
      });
    }

    const assessment = await LoanAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    assessment.status = status;
    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment status updated successfully',
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// Get assessment statistics
exports.getAssessmentStats = async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const filter = {};

    if (groupId) filter.group = groupId;

    // Role-based filtering
    if (req.user.role === 'member') {
      filter.member = req.user.id;
    } else if (req.user.role === 'leader') {
      const userGroups = await Group.find({
        $or: [{ members: req.user.id }, { createdBy: req.user.id }],
      });
      filter.group = { $in: userGroups.map(g => g._id) };
    }

    const assessments = await LoanAssessment.find(filter);

    const stats = {
      total: assessments.length,
      eligible: assessments.filter(a => a.eligible).length,
      ineligible: assessments.filter(a => !a.eligible).length,
      pending: assessments.filter(a => a.status === 'pending').length,
      approved: assessments.filter(a => a.status === 'approved').length,
      rejected: assessments.filter(a => a.status === 'rejected').length,
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
  } catch (error) {
    next(error);
  }
};

// Quick assessment (for real-time calculation)
exports.quickAssessment = async (req, res, next) => {
  try {
    const { memberId, groupId } = req.query;

    // Only officers and admins can perform quick assessments
    if (req.user.role !== 'officer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only officers and admins can perform assessments',
      });
    }

    // Validate member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    // Validate group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if member belongs to the group
    if (!group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Member does not belong to this group',
      });
    }

    // Get member's individual savings
    const memberSavings = await Savings.find({ member: memberId });
    const individualSavings = memberSavings.reduce(
      (sum, saving) => sum + saving.amount,
      0
    );

    // Get group's total savings
    const groupSavings = await Savings.find({ group: groupId });
    const groupTotalSavings = groupSavings.reduce(
      (sum, saving) => sum + saving.amount,
      0
    );

    // Use default assessment rules
    const defaultRules = {
      minGroupSavings: 1000,
      minIndividualSavings: 200,
      maxLoanToGroupSavingsRatio: 0.3,
      maxLoanToIndividualSavingsRatio: 2,
      minLoanAmount: 500,
      maxLoanAmount: 10000,
    };

    // Calculate assessment results
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
        `Group savings ($${groupTotalSavings}) is below minimum requirement ($${defaultRules.minGroupSavings})`
      );
    }
    if (individualSavings < defaultRules.minIndividualSavings) {
      reasons.push(
        `Individual savings ($${individualSavings}) is below minimum requirement ($${defaultRules.minIndividualSavings})`
      );
    }

    const eligible =
      reasons.length === 0 && maxEligibleAmount >= defaultRules.minLoanAmount;
    const recommendedAmount = eligible ? Math.min(maxEligibleAmount, 5000) : 0;

    // Determine risk level
    let riskLevel = 'high';
    if (groupTotalSavings > 5000 && individualSavings > 1000) {
      riskLevel = 'low';
    } else if (groupTotalSavings > 2000 && individualSavings > 500) {
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
        assessmentRules: defaultRules,
      },
    });
  } catch (error) {
    next(error);
  }
};
