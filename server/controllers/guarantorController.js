// server\controllers\guarantorController.js (REVISED)
const Guarantor = require('../models/Guarantor');
const Loan = require('../models/Loan'); // Needed to check loan existence
const User = require('../models/User'); // Needed to check user existence
const asyncHandler = require('../middleware/asyncHandler'); // Import asyncHandler
const { ErrorResponse } = require('../utils'); // Import custom error class
const mongoose = require('mongoose'); // For ObjectId validation

// @desc    Create a new guarantor entry
// @route   POST /api/guarantors
// @access  Private (Admin, Officer, or User with 'can_guarantee_loan' permission)
exports.createGuarantor = asyncHandler(async (req, res, next) => {
  const { loan, guarantor, amountGuaranteed, status } = req.body;

  // Basic validation
  if (!loan || !guarantor || !amountGuaranteed || amountGuaranteed <= 0) {
    return next(
      new ErrorResponse(
        'Loan ID, Guarantor ID, and a positive amount guaranteed are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(loan)) {
    return next(new ErrorResponse('Invalid Loan ID format.', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(guarantor)) {
    return next(new ErrorResponse('Invalid Guarantor User ID format.', 400));
  }

  // Ensure loan and guarantor user exist
  const existingLoan = await Loan.findById(loan);
  if (!existingLoan) {
    return next(new ErrorResponse('Loan not found.', 404));
  }
  const existingGuarantorUser = await User.findById(guarantor);
  if (!existingGuarantorUser) {
    return next(new ErrorResponse('Guarantor user not found.', 404));
  }

  // Optional: Check if the guarantor is already guaranteeing this loan
  const alreadyGuaranteed = await Guarantor.findOne({ loan, guarantor });
  if (alreadyGuaranteed) {
    return next(
      new ErrorResponse('This user is already a guarantor for this loan.', 400)
    );
  }

  // Create the guarantor record
  const newGuarantor = await Guarantor.create({
    loan,
    guarantor,
    amountGuaranteed,
    status: status || 'pending', // Default to pending if not provided
    // approvedBy and approvedAt would be set during an update if status changes to 'approved'
  });

  // Populate for response
  await newGuarantor.populate(
    'loan',
    'amountApproved borrower borrowerModel status'
  );
  await newGuarantor.populate('guarantor', 'name email');

  res.status(201).json({
    success: true,
    message: 'Guarantor record created successfully.',
    data: newGuarantor,
  });
});

// @desc    Get all guarantor entries (system-wide or filtered)
// @route   GET /api/guarantors
// @access  Private (Admin, Officer, or filtered by user/group)
exports.getGuarantors = asyncHandler(async (req, res, next) => {
  // Apply data filter from middleware (if any)
  const query = req.dataFilter || {};

  const guarantors = await Guarantor.find(query)
    .populate('loan', 'amountApproved borrower borrowerModel status') // Populate relevant loan info
    .populate('guarantor', 'name email') // Populate guarantor user info
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: guarantors.length,
    data: guarantors,
  });
});

// @desc    Get a single guarantor entry by ID
// @route   GET /api/guarantors/:id
// @access  Private (Admin, Officer, or if user is guarantor or related to loan borrower)
exports.getGuarantorById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Guarantor ID format.', 400));
  }

  const query = { _id: id };
  // Apply data filter from middleware
  if (req.dataFilter) {
    Object.assign(query, req.dataFilter);
  }

  const guarantor = await Guarantor.findOne(query)
    .populate('loan', 'amountApproved borrower borrowerModel status')
    .populate('guarantor', 'name email');

  if (!guarantor) {
    return next(
      new ErrorResponse(
        'Guarantor record not found or you do not have access.',
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: guarantor,
  });
});

// @desc    Update a guarantor entry (e.g., change status)
// @route   PUT /api/guarantors/:id
// @access  Private (Admin, Officer, or Group Leader with 'can_approve_guarantors' permission)
exports.updateGuarantor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, amountGuaranteed } = req.body; // Allow updating status and potentially amount

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Guarantor ID format.', 400));
  }

  let guarantorRecord = await Guarantor.findById(id);
  if (!guarantorRecord) {
    return next(new ErrorResponse('Guarantor record not found.', 404));
  }

  // Build update object
  const updates = {};
  if (status) {
    const validStatuses = ['pending', 'approved', 'rejected', 'revoked']; // Added 'revoked' for soft delete
    if (!validStatuses.includes(status)) {
      return next(
        new ErrorResponse(
          `Invalid status provided. Must be one of: ${validStatuses.join(', ')}.`,
          400
        )
      );
    }
    updates.status = status;
    // If status is being changed to 'approved' or 'rejected'/'revoked', set approvedBy and approvedAt
    if (status === 'approved' && guarantorRecord.status !== 'approved') {
      updates.approvedBy = req.user.id;
      updates.approvedAt = new Date();
    } else if (
      ['rejected', 'revoked'].includes(status) &&
      !['rejected', 'revoked'].includes(guarantorRecord.status)
    ) {
      updates.approvedBy = req.user.id; // Still record who rejected/revoked
      updates.approvedAt = new Date();
    }
  }
  if (amountGuaranteed !== undefined) {
    if (amountGuaranteed <= 0) {
      return next(
        new ErrorResponse('Amount guaranteed must be positive.', 400)
      );
    }
    updates.amountGuaranteed = amountGuaranteed;
  }

  // Apply updates
  guarantorRecord = await Guarantor.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('loan', 'amountApproved borrower borrowerModel status')
    .populate('guarantor', 'name email')
    .populate('approvedBy', 'name email'); // Populate the approver

  res.status(200).json({
    success: true,
    message: 'Guarantor record updated successfully.',
    data: guarantorRecord,
  });
});

// @desc    Soft delete (revoke/inactivate) a guarantor entry
// @route   DELETE /api/guarantors/:id
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_guarantors' permission)
exports.deleteGuarantor = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorResponse('Invalid Guarantor ID format.', 400));
  }

  const guarantorRecord = await Guarantor.findById(id);
  if (!guarantorRecord) {
    return next(new ErrorResponse('Guarantor record not found.', 404));
  }

  // CRITICAL: Prevent deletion if the associated loan is active and this guarantor is 'approved'
  const associatedLoan = await Loan.findById(guarantorRecord.loan);
  if (
    associatedLoan &&
    ['pending', 'approved', 'disbursed', 'active'].includes(
      associatedLoan.status
    ) &&
    guarantorRecord.status === 'approved'
  ) {
    // You might add logic here to check if this is the *only* guarantor,
    // or if the loan's guarantee requirements are still met without this guarantor.
    return next(
      new ErrorResponse(
        'Cannot delete an approved guarantor for an active loan. Please revoke their guarantee status first.',
        400
      )
    );
  }

  // Instead of hard deleting, change status to 'revoked' or 'inactive'
  guarantorRecord.status = 'revoked'; // Or 'inactive' if that's preferred
  guarantorRecord.revokedBy = req.user.id; // Record who revoked it
  guarantorRecord.revokedAt = new Date(); // Record when it was revoked
  // Optionally add a 'deleted' boolean flag if you want to distinguish from 'revoked' status
  // guarantorRecord.deleted = true;

  await guarantorRecord.save();

  res.status(200).json({
    success: true,
    message: 'Guarantor record revoked successfully (soft deleted).',
    data: {}, // Return empty data for delete success
  });
});
