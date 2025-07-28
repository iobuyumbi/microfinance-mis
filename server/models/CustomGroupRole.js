const mongoose = require('mongoose');

const customGroupRoleSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    name: {
      type: String,
      required: true,
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
          'can_approve_small_loans',
          'can_record_attendance',
          'can_manage_savings',
          'can_view_reports',
          'can_manage_members',
          'can_schedule_meetings',
          'can_edit_group_info',
          'can_manage_roles',
        ],
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For role hierarchy
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    // For role limits
    maxMembers: {
      type: Number,
      default: null, // null means unlimited
      min: 1,
    },
    // For role requirements
    requirements: {
      minSavings: {
        type: Number,
        default: 0,
        min: 0,
      },
      minGroupMembership: {
        type: Number, // months
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
customGroupRoleSchema.index({ group: 1, isActive: 1 });
customGroupRoleSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for member count
customGroupRoleSchema.virtual('memberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'groupRoles.roleId',
  count: true,
});

// Ensure virtuals are serialized
customGroupRoleSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to ensure unique role names within a group
customGroupRoleSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    const existingRole = await this.constructor.findOne({
      group: this.group,
      name: this.name,
      _id: { $ne: this._id },
      isActive: true,
    });

    if (existingRole) {
      throw new Error('A role with this name already exists in this group');
    }
  }
  next();
});

module.exports = mongoose.model('CustomGroupRole', customGroupRoleSchema);
