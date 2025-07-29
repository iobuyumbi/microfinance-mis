// server\models\UserGroupMembership.js
const mongoose = require('mongoose');

const userGroupMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Efficiently find all groups a user belongs to
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true, // Efficiently find all users in a group
    },
    // Reference to the specific CustomGroupRole definition for this group
    groupRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomGroupRole', // This links to the role definition (e.g., 'Treasurer for Group X')
      required: true,
      index: true, // Efficiently find all users with a specific role
    },
    status: {
      // Status of this specific membership (e.g., active, pending approval, suspended)
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active',
    },
    // You could add start/end dates for the role if roles are time-bound
    // startDate: { type: Date, default: Date.now },
    // endDate: Date,
  },
  {
    timestamps: true,
    // Ensure a user can only have one active role/membership per group at a time
    unique: ['user', 'group'],
  }
);

module.exports = mongoose.model(
  'UserGroupMembership',
  userGroupMembershipSchema
);
