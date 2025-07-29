// server\models\CustomGroupRole.js
const mongoose = require('mongoose');

const customGroupRoleSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true, // Added index
    },
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    permissions: [
      {
        type: String,
        enum: [
          'can_approve_loans',
          'can_record_attendance',
          'can_manage_savings',
          'can_view_reports',
          'can_manage_members', // Example: add/remove members
          'can_edit_group_profile', // Example: update group details
          // Add more granular permissions as needed
        ],
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    // Ensure a role name is unique within a specific group
    unique: ['group', 'name'],
  }
);

// Indexing for efficient querying
customGroupRoleSchema.index({ group: 1, name: 1 });
customGroupRoleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('CustomGroupRole', customGroupRoleSchema);
