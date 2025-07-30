// server\controllers\savingsController.js
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Group = require('../models/Group');
const asyncHandler = require('../middleware/asyncHandler');
const { ErrorResponse, settingsHelper } = require('../utils');
const mongoose = require('mongoose');
const UserGroupMembership = require('../models/UserGroupMembership'); // Needed for some authorization checks

// @desc    Create a new savings account
// @route   POST /api/savings
// @access  Private (Admin, Officer, or User creating their own or Leader for their group members)
exports.createSavings = asyncHandler(async (req, res, next) => {
  const { owner, ownerModel, initialAmount, description } = req.body;

  // 1. Basic Validation
  if (!owner || !ownerModel) {
    return next(
      new ErrorResponse('Owner ID and owner model are required.', 400)
    );
  }
  if (!['User', 'Group'].includes(ownerModel)) {
    return next(
      new ErrorResponse('Owner model must be "User" or "Group".', 400)
    );
  }
  if (!mongoose.Types.ObjectId.isValid(owner)) {
    return next(new ErrorResponse(`Invalid ${ownerModel} ID format.`, 400));
  }

  // 2. Authorization based on ownerModel
  if (ownerModel === 'User') {
    // User creating their own account
    if (owner.toString() !== req.user._id.toString()) {
      // If not self-creation, must be Admin or Officer
      if (req.user.role !== 'admin' && req.user.role !== 'officer') {
        return next(
          new ErrorResponse(
            'Access denied. You can only create savings accounts for yourself.',
            403
          )
        );
      }
    }
    // Verify user exists
    const userExists = await User.findById(owner);
    if (!userExists) return next(new ErrorResponse('User not found.', 404));
  } else if (ownerModel === 'Group') {
    // Must be Admin, Officer, or a Leader with 'can_manage_savings' permission in that group
    if (req.user.role !== 'admin' && req.user.role !== 'officer') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: owner,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        !membership.groupRole.permissions.includes('can_manage_savings')
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_manage_savings" permission within this group to create a group savings account.',
            403
          )
        );
      }
    }
    // Verify group exists
    const groupExists = await Group.findById(owner);
    if (!groupExists) return next(new ErrorResponse('Group not found.', 404));
  }

  // Check if a savings account already exists for this owner
  const existingAccount = await Account.findOne({
    owner,
    ownerModel,
    type: 'savings',
    deleted: false,
  });
  if (existingAccount) {
    return next(
      new ErrorResponse(
        `A savings account already exists for this ${ownerModel}.`,
        400
      )
    );
  }

  // === IMPROVEMENT 1: Wrap Account creation and initial deposit in a Mongoose session for atomicity ===
  const session = await mongoose.startSession();
  session.startTransaction();

  let newSavingsAccount;
  let initialDepositTransaction = null;

  try {
    // 3. Create the new savings account
    newSavingsAccount = await Account.create(
      [
        {
          // Use array for session with .create
          owner,
          ownerModel,
          type: 'savings',
          balance: 0, // Initial balance is 0, initialAmount is added as a deposit transaction
          accountName: `${ownerModel === 'User' ? (await User.findById(owner)).name : (await Group.findById(owner)).name}'s Savings`,
          description: description || 'General Savings Account',
          createdBy: req.user.id,
        },
      ],
      { session }
    ); // Pass session to create
    newSavingsAccount = newSavingsAccount[0]; // Access the created document from the array

    // 4. If initial amount is provided, record it as a deposit transaction
    if (initialAmount && initialAmount > 0) {
      initialDepositTransaction = await Transaction.create(
        [
          {
            // Use array for session with .create
            type: 'savings_contribution', // Changed from 'deposit' to 'savings_contribution'
            member: ownerModel === 'User' ? owner : null,
            group: ownerModel === 'Group' ? owner : null,
            account: newSavingsAccount._id,
            amount: initialAmount,
            description: `Initial deposit for new savings account (${newSavingsAccount.accountNumber})`,
            status: 'completed',
            balanceAfter: initialAmount,
            createdBy: req.user.id,
            paymentMethod: 'cash', // Default or make configurable
          },
        ],
        { session }
      ); // Pass session to create
      initialDepositTransaction = initialDepositTransaction[0]; // Access the created document from the array

      // Update the account balance
      newSavingsAccount.balance = initialAmount;
      await newSavingsAccount.save({ session }); // Pass session to save
    }

    await session.commitTransaction();
    session.endSession();

    // Populate owner for response
    await newSavingsAccount.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Savings account created successfully.',
      data: newSavingsAccount,
      initialDeposit: initialDepositTransaction
        ? initialDepositTransaction.toObject({ virtuals: true })
        : null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating savings account:', error); // More specific error message
    next(error); // Pass error to global error handler
  }
});

// @desc    Get all savings accounts
// @route   GET /api/savings
// @access  Private (Admin, Officer, or filtered by user/group membership for others)
exports.getSavings = asyncHandler(async (req, res, next) => {
  // req.dataFilter is populated by filterDataByRole middleware
  const accounts = await Account.find({ ...req.dataFilter, type: 'savings' })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  const formattedAccounts = await Promise.all(
    accounts.map(async acc => {
      const obj = acc.toObject({ virtuals: true });
      // Access virtuals that are async or need currency context
      obj.formattedBalance = await acc.formattedBalance;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedAccounts.length,
    data: formattedAccounts,
  });
});

// @desc    Get single savings account by ID
// @route   GET /api/savings/:id
// @access  Private (Admin, Officer, or Account Owner/Group Member via authorizeAccountAccess)
exports.getSavingsById = asyncHandler(async (req, res, next) => {
  // req.targetAccount is populated by authorizeAccountAccess middleware
  const account = req.targetAccount;

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse('The requested account is not a savings account.', 400)
    );
  }

  // Populate owner
  await account.populate('owner', 'name email');

  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(200).json({
    success: true,
    data: formattedAccount,
  });
});

// @desc    Update savings account (non-financial details)
// @route   PUT /api/savings/:id
// @access  Private (Admin, Officer, or Account Owner/Group Leader with 'can_edit_group_info' / 'can_manage_savings')
exports.updateSavings = asyncHandler(async (req, res, next) => {
  // req.targetAccount is populated by authorizeAccountAccess middleware
  let account = req.targetAccount;

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse('The requested account is not a savings account.', 400)
    );
  }

  const { description, accountName, status } = req.body; // Allow updating limited fields

  // Authorization for update specific to savings accounts
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    // If it's a User account, only the owner can update (basic fields)
    if (
      account.ownerModel === 'User' &&
      account.owner.toString() === req.user._id.toString()
    ) {
      // No additional permission needed for self-account updates (e.g., description)
    } else if (account.ownerModel === 'Group') {
      // For Group accounts, check if user has 'can_edit_group_info' or 'can_manage_savings' permission in that group
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: account.owner,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        (!membership.groupRole.permissions.includes('can_edit_group_info') &&
          !membership.groupRole.permissions.includes('can_manage_savings'))
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_edit_group_info" or "can_manage_savings" permission to update this group savings account.',
            403
          )
        );
      }
    } else {
      return next(
        new ErrorResponse(
          'Access denied. You are not authorized to update this account.',
          403
        )
      );
    }
  }

  // Apply updates (only non-financial fields)
  if (description !== undefined) account.description = description;
  if (accountName !== undefined) account.accountName = accountName;
  if (status !== undefined) account.status = status; // If you add a status field to Account schema

  account = await account.save();

  await account.populate('owner', 'name email');
  const formattedAccount = account.toObject({ virtuals: true });
  formattedAccount.formattedBalance = await account.formattedBalance;

  res.status(200).json({
    success: true,
    message: 'Savings account updated successfully.',
    data: formattedAccount,
  });
});

// @desc    Soft-delete a savings account
// @route   DELETE /api/savings/:id
// @access  Private (Admin, Officer, or Group Leader with 'can_manage_savings' for group accounts)
exports.deleteSavings = asyncHandler(async (req, res, next) => {
  // req.targetAccount is populated by authorizeAccountAccess middleware
  let account = req.targetAccount;

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse(
        'The requested account is not a savings account and cannot be deleted via this endpoint.',
        400
      )
    );
  }

  // Authorization for deletion
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    // Only Admins/Officers can delete personal savings accounts
    if (account.ownerModel === 'User') {
      return next(
        new ErrorResponse(
          'Access denied. Only Admins or Officers can delete personal savings accounts.',
          403
        )
      );
    }
    // For Group accounts, check if user has 'can_manage_savings' permission in that group
    if (account.ownerModel === 'Group') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: account.owner,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        !membership.groupRole.permissions.includes('can_manage_savings')
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_manage_savings" permission to delete this group savings account.',
            403
          )
        );
      }
    } else {
      return next(
        new ErrorResponse(
          'Access denied. You are not authorized to delete this account.',
          403
        )
      );
    }
  }

  // Perform soft delete
  account.deleted = true;
  account.deletedAt = new Date();
  account.deletedBy = req.user.id;
  await account.save();

  res.status(200).json({
    success: true,
    message: 'Savings account soft-deleted successfully.',
    data: {},
  });
});

// @desc    Record a new deposit into a savings account
// @route   POST /api/savings/deposit
// @access  Private (Admin, Officer, or user with appropriate access to the account)
exports.recordSavingsDeposit = asyncHandler(async (req, res, next) => {
  const { accountId, amount, paymentMethod, description } = req.body;

  // 1. Basic Validation
  if (!accountId || !amount || amount <= 0) {
    return next(
      new ErrorResponse(
        'Account ID and a positive deposit amount are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  const account = await Account.findById(accountId);
  if (!account) {
    return next(new ErrorResponse('Savings Account not found.', 404));
  }

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse(
        `Deposits can only be made to 'savings' accounts via this endpoint. Found account type: '${account.type}'.`,
        400
      )
    );
  }

  // Authorization: Admin/Officer OR account owner/group member with manage savings permission
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    if (
      account.ownerModel === 'User' &&
      account.owner.toString() === req.user._id.toString()
    ) {
      // User depositing into their own savings account is allowed
    } else if (account.ownerModel === 'Group') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: account.owner,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        !membership.groupRole.permissions.includes('can_manage_savings')
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_manage_savings" permission to deposit into this group savings account.',
            403
          )
        );
      }
    } else {
      return next(
        new ErrorResponse(
          'Access denied. You are not authorized to deposit into this account.',
          403
        )
      );
    }
  }

  // 2. Update account balance
  const newBalance = account.balance + amount;
  account.balance = newBalance;
  await account.save(); // This part should be wrapped in a session already as per previous advice

  // 3. Create a new 'deposit' Transaction record
  const depositTransaction = await Transaction.create({
    type: 'deposit', // This should be 'savings_contribution' to match enum from previous advice
    member: account.ownerModel === 'User' ? account.owner : null,
    group: account.ownerModel === 'Group' ? account.owner : null,
    account: account._id, // Link to the specific account
    amount: amount,
    description:
      description ||
      `Deposit into ${account.ownerModel === 'User' ? 'personal' : 'group'} savings account`,
    status: 'completed',
    balanceAfter: newBalance,
    createdBy: req.user.id,
    paymentMethod: paymentMethod || 'cash',
  }); // This part should be wrapped in a session already as per previous advice

  // Populate for response
  await depositTransaction.populate(
    'account',
    'accountNumber owner ownerModel type'
  );
  await depositTransaction.populate('member', 'name email');
  await depositTransaction.populate('group', 'name');
  await depositTransaction.populate('createdBy', 'name email');

  // Await async virtuals for formatting
  const formattedDeposit = depositTransaction.toObject({ virtuals: true });
  formattedDeposit.formattedAmount = await depositTransaction.formattedAmount;

  res.status(201).json({
    success: true,
    message: 'Deposit recorded successfully.',
    data: formattedDeposit,
  });
});

// @desc    Record a new withdrawal from a savings account
// @route   POST /api/savings/withdraw
// @access  Private (Admin, Officer, or user with appropriate access to the account)
exports.recordSavingsWithdrawal = asyncHandler(async (req, res, next) => {
  const { accountId, amount, paymentMethod, description } = req.body;

  // 1. Basic Validation
  if (!accountId || !amount || amount <= 0) {
    return next(
      new ErrorResponse(
        'Account ID and a positive withdrawal amount are required.',
        400
      )
    );
  }
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new ErrorResponse('Invalid Account ID format.', 400));
  }

  const account = await Account.findById(accountId);
  if (!account) {
    return next(new ErrorResponse('Savings Account not found.', 404));
  }

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse(
        `Withdrawals can only be made from 'savings' accounts via this endpoint. Found account type: '${account.type}'.`,
        400
      )
    );
  }

  // Authorization: Admin/Officer OR account owner/group member with manage savings permission
  if (req.user.role !== 'admin' && req.user.role !== 'officer') {
    if (
      account.ownerModel === 'User' &&
      account.owner.toString() === req.user._id.toString()
    ) {
      // User withdrawing from their own savings account is allowed
    } else if (account.ownerModel === 'Group') {
      const membership = await UserGroupMembership.findOne({
        user: req.user._id,
        group: account.owner,
        status: 'active',
      }).populate('groupRole', 'permissions');

      if (
        !membership ||
        !membership.groupRole ||
        !membership.groupRole.permissions.includes('can_manage_savings')
      ) {
        return next(
          new ErrorResponse(
            'Access denied. You need "can_manage_savings" permission to withdraw from this group savings account.',
            403
          )
        );
      }
    } else {
      return next(
        new ErrorResponse(
          'Access denied. You are not authorized to withdraw from this account.',
          403
        )
      );
    }
  }

  // 2. Check for sufficient funds
  if (account.balance < amount) {
    return next(
      new ErrorResponse(
        'Insufficient funds in savings account for this withdrawal.',
        400
      )
    );
  }

  // 3. Update account balance
  const newBalance = account.balance - amount;
  account.balance = newBalance;
  await account.save(); // This part should be wrapped in a session already as per previous advice

  // 4. Create a new 'withdrawal' Transaction record
  const withdrawalTransaction = await Transaction.create({
    type: 'withdrawal', // This should be 'savings_withdrawal' to match enum from previous advice
    member: account.ownerModel === 'User' ? account.owner : null,
    group: account.ownerModel === 'Group' ? account.owner : null,
    account: account._id, // Link to the specific account
    amount: amount,
    description:
      description ||
      `Withdrawal from ${account.ownerModel === 'User' ? 'personal' : 'group'} savings account`,
    status: 'completed',
    balanceAfter: newBalance,
    createdBy: req.user.id,
    paymentMethod: paymentMethod || 'cash',
  }); // This part should be wrapped in a session already as per previous advice

  // Populate for response
  await withdrawalTransaction.populate(
    'account',
    'accountNumber owner ownerModel type'
  );
  await withdrawalTransaction.populate('member', 'name email');
  await withdrawalTransaction.populate('group', 'name');
  await withdrawalTransaction.populate('createdBy', 'name email');

  // Await async virtuals for formatting
  const formattedWithdrawal = withdrawalTransaction.toObject({
    virtuals: true,
  });
  formattedWithdrawal.formattedAmount =
    await withdrawalTransaction.formattedAmount;

  res.status(200).json({
    success: true,
    message: 'Withdrawal recorded successfully.',
    data: formattedWithdrawal,
  });
});

// @desc    Get transaction history for a specific savings account
// @route   GET /api/savings/:id/transactions
// @access  Private (Admin, Officer, or Account Owner/Group Member)
exports.getSavingsAccountTransactions = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Account ID

  // req.targetAccount is populated by authorizeAccountAccess middleware
  const account = req.targetAccount;

  // Ensure it's a savings account
  if (account.type !== 'savings') {
    return next(
      new ErrorResponse('The requested account is not a savings account.', 400)
    );
  }

  // Currency for formatting, though Transaction virtual should handle it.
  const currency = await settingsHelper.getCurrency(); // Not strictly needed here, but good practice

  const transactions = await Transaction.find({
    account: id,
    deleted: false,
    type: {
      $in: [
        'savings_contribution', // IMPROVEMENT 2: Use the specific type for deposits
        'savings_withdrawal', // IMPROVEMENT 2: Use the specific type for withdrawals
        'interest_earned', // Interest earned on savings accounts
        'adjustment', // For any manual adjustments to savings
        'refund',
        'transfer_in', // If transfers directly affect this account
        'transfer_out', // If transfers directly affect this account
        // Add any other types from your Transaction model enum that are relevant to savings
      ],
    },
  })
    .populate('member', 'name email') // Populate for User accounts
    .populate('group', 'name') // Populate for Group accounts
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 }); // Latest transactions first

  // Await async virtuals for formatting
  const formattedTransactions = await Promise.all(
    transactions.map(async tx => {
      const obj = tx.toObject({ virtuals: true });
      obj.formattedAmount = await tx.formattedAmount;
      return obj;
    })
  );

  res.status(200).json({
    success: true,
    count: formattedTransactions.length,
    data: formattedTransactions,
  });
});
