// server/controllers/userController.js
const User = require('../models/User');
const Group = require('../models/Group');
const Account = require('../models/Account'); // For savings/balances
const Transaction = require('../models/Transaction'); // For all financial movements
const Loan = require('../models/Loan'); // Ensure Loan model is imported for financial summary
const UserGroupMembership = require('../models/UserGroupMembership'); // Import for direct membership queries

const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse, settingsHelper } = require('../utils');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a new user (by Admin, Officer, or Leader)
// @route   POST /api/users
// @access  Private (Admin, Officer, Leader)
exports.createUser = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    password,
    role, // Role provided in the request body
    phone,
    address,
    gender,
    nationalID, // Corrected from nationalId to nationalID
  } = req.body;

  // Basic validation for required fields, though handled by middleware for initial check
  if (!name || !email || !password || !role) {
    return next(
      new ErrorResponse('Name, email, password, and role are required.', 400)
    );
  }

  // Validate the role provided against the User model's enum
  const validRoles = ['member', 'leader', 'officer', 'admin', 'user']; // 'user' is also a valid initial role
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
    // Determine isMember status based on the role
    const isMember = ['member', 'leader', 'officer', 'admin'].includes(role);

    // Create the user
    const newUser = await User.create(
      [
        {
          name,
          email,
          password, // Password will be hashed by a pre-save hook in the User model
          role,
          phone,
          address,
          gender,
          nationalID, // Use nationalID as per model
          status: 'active', // Default status for newly created users
          isMember: isMember, // Set isMember based on role
          // createdBy: req.user.id, // Uncomment if you have this field in User model
        },
      ],
      { session }
    );

    const user = newUser[0]; // User.create returns an array

    // Create a default primary savings account for the new user
    const currency = await settingsHelper.getCurrency(); // Get default currency from settings

    await Account.create(
      [
        {
          owner: user._id,
          ownerModel: 'User',
          type: 'savings', // Assuming 'savings' is the default account type
          accountName: `${user.name}'s Primary Savings`,
          balance: 0,
          currency: currency,
          status: 'active',
          // createdBy: req.user.id, // Uncomment if you have this field in Account model
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Return the new user data (excluding password)
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.__v;

    res.status(201).json({
      success: true,
      message: 'User and primary savings account created successfully.',
      data: userResponse,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating user and account:', error);
    // Handle Mongoose validation errors or other specific errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    next(
      new ErrorResponse(
        'Failed to create user and account. ' + error.message,
        500
      )
    );
  }
});

// @desc    Get all users - filtered based on user role and permissions
// @route   GET /api/users
// @access  Private (filterDataByRole middleware handles access)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // req.dataFilter is set by the filterDataByRole middleware
  // This endpoint should primarily return User documents based on global roles/status.
  // For group-specific member lists, use the memberController.getMembers endpoint with groupId.
  const query = req.dataFilter || {};

  const users = await User.find(query)
    .select('-password -__v') // Exclude password hash and version key
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  // Use req.dataFilter for access control (e.g., a member can only see their own profile)
  const query = { _id: id, ...(req.dataFilter || {}) };

  const user = await User.findOne(query).select('-password -__v'); // Exclude password hash and version key

  if (!user) {
    return next(
      new ErrorResponse('User not found or you do not have access.', 404)
    );
  }

  // If you need group memberships here, you'd fetch them separately:
  const memberships = await UserGroupMembership.find({
    user: user._id,
  }).populate('group', 'name location leader'); // Populate group details

  res
    .status(200)
    .json({ success: true, data: { ...user.toObject(), memberships } });
});

// @desc    Update authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private (Self-service for authenticated user)
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const updates = { ...req.body };

  // Prevent direct updates to sensitive fields via this endpoint
  const sensitiveFields = [
    'role',
    'status',
    'password',
    'isMember', // isMember should be managed by role changes or memberController
    'memberId', // memberId should be managed by admin/officer if needed
    'createdAt',
    'updatedAt',
    'deleted',
    'deletedAt',
    'deletedBy',
  ];
  sensitiveFields.forEach(field => {
    if (updates.hasOwnProperty(field)) {
      delete updates[field];
    }
  });

  // Ensure there's something to update after stripping sensitive fields
  if (Object.keys(updates).length === 0) {
    return next(
      new ErrorResponse('No valid fields provided for profile update.', 400)
    );
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
    select: '-password -__v', // Exclude password hash and version key from response
  });

  if (!user) {
    return next(new ErrorResponse('User not found.', 404)); // Should ideally not happen for req.user.id
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: user,
  });
});

// @desc    Update a user's global role or status (Admin/Officer only)
// @route   PUT /api/users/:id
// @access  Private (Admin, Officer) - authorizeRoles middleware handles this
exports.updateUserRoleStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role, status, isMember } = req.body; // isMember can also be passed, but derived from role

  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Prevent a user from changing their own role/status via this endpoint if they are admin/officer
  if (
    req.user.id.toString() === id.toString() &&
    (req.user.role === 'admin' || req.user.role === 'officer')
  ) {
    return next(
      new ErrorResponse(
        'Admins/Officers cannot change their own global role or status via this endpoint.',
        403
      )
    );
  }

  // Validate inputs if provided
  if (role) {
    const validGlobalRoles = ['admin', 'officer', 'leader', 'member', 'user'];
    if (!validGlobalRoles.includes(role)) {
      return next(new ErrorResponse('Invalid global role provided.', 400));
    }
    user.role = role;
    // Automatically update isMember based on the new role
    user.isMember = ['member', 'leader', 'officer', 'admin'].includes(role);
  }

  if (status) {
    const validGlobalStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validGlobalStatuses.includes(status)) {
      return next(new ErrorResponse('Invalid global status provided.', 400));
    }
    user.status = status;
    // If status becomes inactive or suspended, also set isMember to false
    if (status === 'inactive' || status === 'suspended') {
      user.isMember = false;
    }
  } else if (typeof isMember === 'boolean') {
    // Allow direct setting of isMember if status is not provided, but role is not changing
    user.isMember = isMember;
  }

  // Ensure at least one of role, status, or isMember was provided to update
  if (!role && !status && typeof isMember !== 'boolean') {
    return next(
      new ErrorResponse(
        'At least one of "role", "status", or "isMember" is required for update.',
        400
      )
    );
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User global role/status updated successfully.',
    data: user.toObject({
      virtuals: true,
      getters: true,
      exclude: ['password', '__v'],
    }),
  });
});

// @desc    Soft delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin) - authorizeRoles middleware handles this
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorResponse('User not found.', 404));
  }

  // Prevent deleting self for admin (and prevent deleting the initial admin account if possible)
  if (user._id.toString() === req.user.id.toString()) {
    return next(
      new ErrorResponse(
        'You cannot delete your own account via this endpoint.',
        403
      )
    );
  }

  // Implement soft delete instead of hard delete for auditability
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    user.deleted = true; // Assuming you add a 'deleted' boolean field to your User model
    user.deletedAt = new Date();
    user.deletedBy = req.user.id; // Record who soft-deleted it
    user.status = 'suspended'; // Also change global status to suspended
    user.isMember = false; // No longer an active member
    // Optional: Invalidate user's active tokens if they are still logged in

    await user.save({ session });

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

    res
      .status(200)
      .json({ success: true, message: 'User soft-deleted successfully.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error soft-deleting user:', error);
    return next(new ErrorResponse('Failed to soft delete user.', 500));
  }
});

// @desc    Get user's financial summary
// @route   GET /api/users/:id/financial-summary (or /api/users/me/financial-summary)
// @access  Private (authorizeOwnerOrAdmin middleware handles access)
exports.getUserFinancialSummary = asyncHandler(async (req, res, next) => {
  const userId = req.params.id === 'me' ? req.user.id : req.params.id;

  if (!isValidObjectId(userId)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  const currency = await settingsHelper.getCurrency();

  // Get user's primary savings account balance
  const userSavingsAccount = await Account.findOne({
    owner: userId,
    ownerModel: 'User',
    type: 'savings',
    status: 'active',
  });
  const totalSavings = userSavingsAccount ? userSavingsAccount.balance : 0;

  // Get loans associated with the user as borrower
  const userLoans = await Loan.find({
    borrower: userId,
    status: { $in: ['approved', 'pending', 'active', 'overdue', 'completed'] },
  });

  let totalLoansApproved = 0;
  let totalLoansPending = 0;
  let totalOutstandingLoanBalance = 0;
  let totalLoansPaid = 0;

  userLoans.forEach(loan => {
    if (
      loan.status === 'approved' ||
      loan.status === 'active' ||
      loan.status === 'overdue'
    ) {
      totalLoansApproved += loan.amountApproved || 0;
      totalOutstandingLoanBalance += loan.currentBalance || 0;
    } else if (loan.status === 'pending') {
      totalLoansPending += loan.amountRequested || 0;
    } else if (loan.status === 'completed') {
      totalLoansPaid += loan.amountApproved || 0;
    }
  });

  // Get user's transactions (deposits, withdrawals, loan repayments)
  const userTransactions = await Transaction.find({
    member: userId, // Assuming 'member' field in Transaction refers to User ID
    deleted: false,
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .limit(10); // Last 10 transactions for history

  // Populate and format recent transactions (assuming Transaction model has formattedAmount virtual)
  const formattedTransactions = await Promise.all(
    userTransactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      // If formattedAmount is a virtual that needs async calculation (e.g., fetching currency)
      // ensure it's awaited if necessary, otherwise it's just a direct property.
      // For now, assuming it's a direct property or handled by toObject({ virtuals: true })
      return obj;
    })
  );

  // Get groups the user is an active member of (via UserGroupMembership)
  const userActiveMemberships = await UserGroupMembership.find({
    user: userId,
    status: 'active',
  }).populate('group', 'name members totalSavings totalLoansOutstanding'); // Populate relevant group fields

  // Summarize group financial data for groups where user is an active member
  const groupSummaries = await Promise.all(
    userActiveMemberships.map(async membership => {
      const group = membership.group;
      if (!group) return null; // Handle cases where group might be dissolved or not found

      // Fetch group's main account balance if it exists
      const groupAccount = await Account.findOne({
        owner: group._id,
        ownerModel: 'Group',
        type: { $in: ['loan_fund', 'savings', 'operating_fund'] }, // Consider various group account types
        status: 'active',
      });

      let groupTotalSavings = groupAccount ? groupAccount.balance : 0;

      // Fetch loans associated with this specific group
      const groupLoans = await Loan.find({
        group: group._id,
        status: { $in: ['approved', 'active', 'overdue', 'completed'] },
      });

      let groupTotalLoansApproved = 0;
      let groupTotalOutstandingLoans = 0;
      let groupTotalLoansPaid = 0;

      groupLoans.forEach(loan => {
        if (
          loan.status === 'approved' ||
          loan.status === 'active' ||
          loan.status === 'overdue'
        ) {
          groupTotalLoansApproved += loan.amountApproved || 0;
          groupTotalOutstandingLoans += loan.currentBalance || 0;
        } else if (loan.status === 'completed') {
          groupTotalLoansPaid += loan.amountApproved || 0;
        }
      });

      return {
        groupId: group._id,
        groupName: group.name,
        groupMembersCount: group.members ? group.members.length : 0, // Use the populated members array count
        totalGroupSavings: groupTotalSavings,
        formattedTotalGroupSavings: `${currency} ${groupTotalSavings.toFixed(2)}`,
        totalGroupLoansApproved: groupTotalLoansApproved,
        formattedTotalGroupLoansApproved: `${currency} ${groupTotalLoansApproved.toFixed(2)}`,
        totalGroupOutstandingLoans: groupTotalOutstandingLoans,
        formattedTotalGroupOutstandingLoans: `${currency} ${groupTotalOutstandingLoans.toFixed(2)}`,
        totalGroupLoansPaid: groupTotalLoansPaid,
        formattedTotalGroupLoansPaid: `${currency} ${groupTotalLoansPaid.toFixed(2)}`,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      userId,
      personalSavings: totalSavings,
      formattedPersonalSavings: `${currency} ${totalSavings.toFixed(2)}`,
      personalLoans: {
        totalApproved: totalLoansApproved,
        formattedTotalApproved: `${currency} ${totalLoansApproved.toFixed(2)}`,
        totalPending: totalLoansPending,
        formattedTotalPending: `${currency} ${totalLoansPending.toFixed(2)}`,
        totalOutstanding: totalOutstandingLoanBalance,
        formattedTotalOutstanding: `${currency} ${totalOutstandingLoanBalance.toFixed(2)}`,
        totalPaid: totalLoansPaid,
        formattedTotalPaid: `${currency} ${totalLoansPaid.toFixed(2)}`,
      },
      recentTransactions: formattedTransactions,
      groupFinancialOverview: groupSummaries.filter(Boolean), // Filter out any null entries
    },
  });
});

// @desc    Get groups for a specific user
// @route   GET /api/users/:id/groups
// @access  Private (owner or admin)
exports.getUserGroups = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid user ID format.', 400));
  }

  // Find active memberships for this user
  const memberships = await UserGroupMembership.find({
    user: id,
    status: 'active',
  })
    .populate(
      'group',
      'name description location status membersCount totalSavings totalLoansOutstanding'
    )
    .populate('user', 'name email role');

  const groups = memberships.map(membership => ({
    groupId: membership.group._id,
    groupName: membership.group.name,
    groupDescription: membership.group.description,
    groupLocation: membership.group.location,
    groupStatus: membership.group.status,
    membersCount: membership.group.membersCount,
    totalSavings: membership.group.totalSavings,
    totalLoansOutstanding: membership.group.totalLoansOutstanding,
    userRoleInGroup: membership.roleInGroup,
    joinedDate: membership.joinedDate,
    membershipId: membership._id,
  }));

  res.status(200).json({
    success: true,
    count: groups.length,
    data: groups,
  });
});
