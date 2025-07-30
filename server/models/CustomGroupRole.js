// server\models\CustomGroupRole.js (REVISED permissions enum)
const mongoose = require('mongoose');

const customGroupRoleSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
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
          // Core Permissions (from controller's getDefaultPermissions)
          'view_group_info',
          'view_group_members',
          'view_group_meetings',
          'view_own_contributions',
          'make_contributions',
          'view_own_loans',
          'apply_for_loans',
          'can_edit_group_info',
          'can_manage_members',
          'can_manage_roles',
          'can_manage_meetings',
          'can_manage_contributions',
          'can_manage_loans',
          'can_view_reports',
          'can_create_group', // Leader can create new groups if system allows

          // Additional Permissions (from your initial enum)
          'can_approve_loans', // e.g., officer/leader can approve loans
          'can_record_attendance', // e.g., secretary can record attendance
          'can_manage_savings', // e.g., treasurer can manage savings
          // Add more as your system grows (e.g., 'can_manage_funds', 'can_create_meetings')
        ],
        required: true, // A permission string must be valid based on enum
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    unique: ['group', 'name'],
  }
);

customGroupRoleSchema.index({ group: 1, name: 1 }); // This index is redundant due to unique: ['group', 'name']
customGroupRoleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('CustomGroupRole', customGroupRoleSchema);
