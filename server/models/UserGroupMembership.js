// server/models/UserGroupMembership.js
const mongoose = require('mongoose');

const UserGroupMembershipSchema = new mongoose.Schema(
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
    roleInGroup: {
      // Using a simple enum for roles within the group
      type: String,
      enum: ['member', 'leader', 'treasurer', 'secretary'], // Specific roles within a group
      default: 'member',
    },
    status: {
      // Status of this specific membership (e.g., active, pending approval, suspended)
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active',
    },
    joinedDate: {
      // Useful for tracking when a member joined a specific group
      type: Date,
      default: Date.now,
    },
    leftDate: {
      // Set if the member leaves the group (for historical tracking)
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Keep your existing timestamps
    // Ensure a user can only have one active membership per group at a time
    // This index ensures uniqueness for the user-group pair regardless of status,
    // which is generally good. If you need multiple memberships (e.g., historical inactive ones),
    // you might need a compound unique index with status. For now, this is fine.
    unique: ['user', 'group'], // This creates a compound unique index
  }
);

// Ensure a user can only have one active membership per group
UserGroupMembershipSchema.index({ user: 1, group: 1 }, { unique: true });

// Middleware to update `members` array and `membersCount` in Group model
UserGroupMembershipSchema.post('save', async function (doc, next) {
  try {
    const Group = mongoose.model('Group');
    // Find the old document to compare status if it's an update
    const oldDoc = await this.model.findById(doc._id);

    if (doc.status === 'active' && (!oldDoc || oldDoc.status !== 'active')) {
      // If the membership became active (new or changed from non-active to active)
      await Group.findByIdAndUpdate(
        doc.group,
        { $addToSet: { members: doc.user }, $inc: { membersCount: 1 } },
        { new: true }
      );
    } else if (
      doc.status !== 'active' &&
      oldDoc &&
      oldDoc.status === 'active'
    ) {
      // If the membership changed from active to non-active
      await Group.findByIdAndUpdate(
        doc.group,
        { $pull: { members: doc.user }, $inc: { membersCount: -1 } },
        { new: true }
      );
    }
  } catch (error) {
    console.error(
      'Error updating Group membersCount/members array on save:',
      error
    );
  }
  next();
});

UserGroupMembershipSchema.post('remove', async function (doc, next) {
  try {
    const Group = mongoose.model('Group');
    // Decrement membersCount and remove from members array when a membership is truly removed
    await Group.findByIdAndUpdate(
      doc.group,
      { $pull: { members: doc.user }, $inc: { membersCount: -1 } },
      { new: true }
    );
  } catch (error) {
    console.error(
      'Error on Group membersCount/members array on remove:',
      error
    );
  }
  next();
});

module.exports = mongoose.model(
  'UserGroupMembership',
  UserGroupMembershipSchema
);
