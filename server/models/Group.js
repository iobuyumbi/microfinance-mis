// server/models/Group.js
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    location: {
      // Added from your previous model
      type: String,
      required: [true, 'Please add a location for the group'],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group must have a leader'],
    },
    status: {
      type: String,
      // Merged statuses: 'dissolved' used for soft delete of groups
      enum: ['active', 'inactive', 'pending', 'dissolved'],
      default: 'active', // Default to active, or pending if group creation requires approval
    },
    formationDate: {
      // Using your naming
      type: Date,
      default: Date.now,
    },
    // Members array for quick lookup of members in a group.
    // This array will be managed by the UserGroupMembership post-save/remove hooks.
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Count of active members in the group (managed by UserGroupMembership hooks)
    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Group financial details (from your previous model)
    totalSavings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLoansOutstanding: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Group-specific loan/savings rules (from your previous model)
    minMemberSavingsForLoan: { type: Number, default: 200 },
    maxLoanRatioToGroupSavings: { type: Number, default: 0.3 },
    // Reference to a custom group account (from your previous model)
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      unique: true, // Each group should have one account
      sparse: true,
    },
    deletedAt: Date, // For soft delete audit
    deletedBy: {
      // For soft delete audit
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Keep your existing timestamps
    toJSON: { virtuals: true }, // Enable virtuals
    toObject: { virtuals: true }, // Enable virtuals
  }
);

// Index for efficient querying
GroupSchema.index({ leader: 1 });
GroupSchema.index({ status: 1 });
// The 'name' field already has unique: true which creates an index automatically

// Virtual for fetching detailed group memberships (if needed, though members array is direct)
// This virtual is less critical now that `members` array is direct, but can be used for full membership objects
GroupSchema.virtual('groupMemberships', {
  ref: 'UserGroupMembership',
  localField: '_id',
  foreignField: 'group',
  justOne: false,
});

module.exports = mongoose.model('Group', GroupSchema);
