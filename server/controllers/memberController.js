// server/controllers/memberController.js
// This controller handles all logic for managing members, groups, and group memberships.
// Each function is exported and used in the route files. Comments are provided for clarity.

const Group = require('../models/Group');
const User = require('../models/User');
const Account = require('../models/Account');
const UserGroupMembership = require('../models/UserGroupMembership');
// Removed CustomGroupRole as we're using an enum directly in UserGroupMembership
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Meeting = require('../models/Meeting');

const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse, settingsHelper } = require('../utils');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// --- Member Management Functions ---

/**
 * Create a new member (user with member role)
 * Route: POST /api/members
 * Access: Private (Admin, Officer)
 * This function creates a new user with the 'member' role, ensures required fields are present,
 * checks for duplicate emails, and creates a default savings account for the member.
 */
exports.createMember = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    address,
    gender,
    nationalID,
    role = 'member', // Default to member role
  } = req.body;

  // Basic validation for required fields
  if (!name || !email || !password) {
    return next(
      new ErrorResponse('Name, email, and password are required.', 400)
    );
  }

  // Validate the role provided
  const validRoles = ['member', 'leader', 'officer', 'admin'];
  if (!validRoles.includes(role)) {
    return next(
      new ErrorResponse(
        `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}.`,
        400
      )
    );
  }

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new ErrorResponse('A user with this email already exists.', 400)
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create the user with member role
    const newUser = await User.create(
      [
        {
          name,
          email,
          password,
          role,
          phone,
          address,
          gender,
          nationalID,
          status: 'active',
          isMember: true, // Set isMember to true for members
        },
      ],
      { session }
    );

    const user = newUser[0];

    // Create a default primary savings account for the new member
    const currency = await settingsHelper.getCurrency();

    await Account.create(
      [
        {
          owner: user._id,
          ownerModel: 'User',
          type: 'savings',
          accountName: `${user.name}'s Primary Savings`,
          balance: 0,
          currency: currency,
          status: 'active',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Member created successfully.',
      data: user,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating member:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    next(new ErrorResponse('Failed to create member. ' + error.message, 500));
  }
});

/**
 * Get all members (filtered based on user role)
 * Route: GET /api/members
 * Access: Private (Admin, Officer, Leader - filtered)
 * Returns a list of all members, filtered by the user's role (handled by middleware).
 */
exports.getMembers = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  const members = await User.find(req.dataFilter || {})
    .select('-password')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: members.length,
    data: members,
  });
});

/**
 * Get a single member by ID
 * Route: GET /api/members/:id
 * Access: Private (Admin, Officer, Leader - filtered, Member - self)
 * Returns a single member if the user has access (checked by middleware).
 */
exports.getMemberById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid member ID format.', 400));
  }

  // Use req.dataFilter for access control
  const query = { _id: id, ...(req.dataFilter || {}) };

  const member = await User.findOne(query).select('-password');

  if (!member) {
    return next(
      new ErrorResponse('Member not found or you do not have access.', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: member,
  });
});

/**
 * Update a member's details
 * Route: PUT /api/members/:id
 * Access: Private (Admin, Officer - limited)
 * Allows updating member details if the user has permission.
 */
exports.updateMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid member ID format.', 400));
  }

  // Use req.dataFilter for access control
  const query = { _id: id, ...(req.dataFilter || {}) };
  let member = await User.findOne(query);

  if (!member) {
    return next(
      new ErrorResponse(
        'Member not found or you do not have permission to update.',
        404
      )
    );
  }

  const { name, email, phone, address, gender, nationalID, role, status } =
    req.body;

  // Update allowed fields if provided
  if (name !== undefined) member.name = name;
  if (email !== undefined) member.email = email;
  if (phone !== undefined) member.phone = phone;
  if (address !== undefined) member.address = address;
  if (gender !== undefined) member.gender = gender;
  if (nationalID !== undefined) member.nationalID = nationalID;
  if (role !== undefined) member.role = role;
  if (status !== undefined) member.status = status;

  await member.save();

  // Remove password from response
  member.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Member updated successfully.',
    data: member,
  });
});

/**
 * Delete/Deactivate a member (soft delete)
 * Route: DELETE /api/members/:id
 * Access: Private (Admin)
 * Soft deletes a member by marking their status as inactive and deactivating related accounts and memberships.
 */
exports.deleteMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid member ID format.', 400));
  }

  const member = await User.findById(id);
  if (!member) {
    return next(new ErrorResponse('Member not found.', 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete the member
    member.status = 'inactive';
    member.deletedAt = new Date();
    member.deletedBy = req.user.id;
    await member.save({ session });

    // Mark associated accounts as inactive
    await Account.updateMany(
      { owner: id, ownerModel: 'User' },
      { status: 'inactive' },
      { session }
    );

    // Mark all active group memberships as inactive
    await UserGroupMembership.updateMany(
      { user: id, status: 'active' },
      { status: 'inactive', leftDate: Date.now() },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Member soft-deleted successfully.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error soft-deleting member:', error);
    return next(new ErrorResponse('Failed to soft delete member.', 500));
  }
});
