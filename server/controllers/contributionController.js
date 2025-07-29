const Contribution = require('../models/Contribution');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all contributions
// @route   GET /api/contributions
// @access  Private (Admin, Officer)
exports.getAllContributions = asyncHandler(async (req, res, next) => {
  const { groupId, year, period, search } = req.query;

  let query = {};

  // Filter by group if provided
  if (groupId) {
    query.groupId = groupId;
  }

  // Filter by year if provided
  if (year && year !== 'all') {
    query.year = year;
  }

  // Filter by period if provided
  if (period && period !== 'all') {
    query.period = period;
  }

  // Search by member name
  if (search) {
    query.memberName = { $regex: search, $options: 'i' };
  }

  const contributions = await Contribution.find(query)
    .populate('groupId', 'name')
    .populate('memberId', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contributions.length,
    data: contributions,
  });
});

// @desc    Get contribution by ID
// @route   GET /api/contributions/:id
// @access  Private (Admin, Officer)
exports.getContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Contribution.findById(req.params.id)
    .populate('groupId', 'name')
    .populate('memberId', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!contribution) {
    return next(new ErrorResponse('Contribution not found', 404));
  }

  res.status(200).json({
    success: true,
    data: contribution,
  });
});

// @desc    Create new contribution
// @route   POST /api/contributions
// @access  Private (Admin, Officer)
exports.createContribution = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;

  const contribution = await Contribution.create(req.body);

  await contribution.populate([
    { path: 'groupId', select: 'name' },
    { path: 'memberId', select: 'name email' },
    { path: 'createdBy', select: 'name' },
  ]);

  res.status(201).json({
    success: true,
    data: contribution,
  });
});

// @desc    Update contribution
// @route   PUT /api/contributions/:id
// @access  Private (Admin, Officer)
exports.updateContribution = asyncHandler(async (req, res, next) => {
  req.body.updatedBy = req.user.id;

  let contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    return next(new ErrorResponse('Contribution not found', 404));
  }

  contribution = await Contribution.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: 'groupId', select: 'name' },
    { path: 'memberId', select: 'name email' },
    { path: 'createdBy', select: 'name' },
    { path: 'updatedBy', select: 'name' },
  ]);

  res.status(200).json({
    success: true,
    data: contribution,
  });
});

// @desc    Delete contribution
// @route   DELETE /api/contributions/:id
// @access  Private (Admin only)
exports.deleteContribution = asyncHandler(async (req, res, next) => {
  const contribution = await Contribution.findById(req.params.id);

  if (!contribution) {
    return next(new ErrorResponse('Contribution not found', 404));
  }

  await contribution.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get contributions by group
// @route   GET /api/groups/:groupId/contributions
// @access  Private (Admin, Officer, Leader)
exports.getGroupContributions = asyncHandler(async (req, res, next) => {
  const contributions = await Contribution.find({ groupId: req.params.groupId })
    .populate('memberId', 'name email')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contributions.length,
    data: contributions,
  });
});

// @desc    Get contribution summary
// @route   GET /api/groups/:groupId/contributions/summary
// @access  Private (Admin, Officer, Leader)
exports.getContributionSummary = asyncHandler(async (req, res, next) => {
  const contributions = await Contribution.find({
    groupId: req.params.groupId,
  });

  const summary = {
    totalMembers: contributions.length,
    totalPrincipal: contributions.reduce((sum, c) => sum + c.principal, 0),
    totalJune: contributions.reduce((sum, c) => sum + c.june, 0),
    totalJuly: contributions.reduce((sum, c) => sum + c.july, 0),
    totalAugust: contributions.reduce((sum, c) => sum + c.august, 0),
    totalDecember: contributions.reduce((sum, c) => sum + c.december, 0),
    grandTotal: contributions.reduce((sum, c) => sum + c.total, 0),
    totalActualContribution: contributions.reduce(
      (sum, c) => sum + c.actualContribution,
      0
    ),
    interestEarned: 28.0, // This could be calculated from actual data
  };

  res.status(200).json({
    success: true,
    data: summary,
  });
});

// @desc    Bulk import contributions
// @route   POST /api/groups/:groupId/contributions/bulk
// @access  Private (Admin, Officer)
exports.bulkImportContributions = asyncHandler(async (req, res, next) => {
  const { contributions } = req.body;

  if (!Array.isArray(contributions)) {
    return next(new ErrorResponse('Contributions must be an array', 400));
  }

  // Add groupId and createdBy to each contribution
  const contributionsWithMeta = contributions.map(cont => ({
    ...cont,
    groupId: req.params.groupId,
    createdBy: req.user.id,
  }));

  const createdContributions = await Contribution.insertMany(
    contributionsWithMeta
  );

  res.status(201).json({
    success: true,
    count: createdContributions.length,
    data: createdContributions,
  });
});

// @desc    Export contributions
// @route   GET /api/groups/:groupId/contributions/export
// @access  Private (Admin, Officer)
exports.exportContributions = asyncHandler(async (req, res, next) => {
  const { format = 'csv' } = req.query;

  const contributions = await Contribution.find({ groupId: req.params.groupId })
    .populate('memberId', 'name email')
    .sort({ memberName: 1 });

  if (format === 'csv') {
    // Generate CSV
    const csvData = contributions.map(cont => ({
      'Member Name': cont.memberName,
      Principal: cont.principal,
      June: cont.june,
      July: cont.july,
      August: cont.august,
      December: cont.december,
      Total: cont.total,
      Year: cont.year,
      Period: cont.period,
      'Actual Contribution': cont.actualContribution,
    }));

    res.status(200).json({
      success: true,
      data: csvData,
      format: 'csv',
    });
  } else {
    res.status(200).json({
      success: true,
      data: contributions,
    });
  }
});

// @desc    Get member contribution history
// @route   GET /api/members/:memberId/contributions
// @access  Private (Admin, Officer, Leader)
exports.getMemberContributionHistory = asyncHandler(async (req, res, next) => {
  const contributions = await Contribution.find({
    memberId: req.params.memberId,
  })
    .populate('groupId', 'name')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: contributions.length,
    data: contributions,
  });
});

// @desc    Update member contribution
// @route   PUT /api/members/:memberId/contributions
// @access  Private (Admin, Officer)
exports.updateMemberContribution = asyncHandler(async (req, res, next) => {
  req.body.updatedBy = req.user.id;

  const contribution = await Contribution.findOneAndUpdate(
    { memberId: req.params.memberId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate([
    { path: 'groupId', select: 'name' },
    { path: 'memberId', select: 'name email' },
    { path: 'createdBy', select: 'name' },
    { path: 'updatedBy', select: 'name' },
  ]);

  if (!contribution) {
    return next(new ErrorResponse('Contribution not found', 404));
  }

  res.status(200).json({
    success: true,
    data: contribution,
  });
});
