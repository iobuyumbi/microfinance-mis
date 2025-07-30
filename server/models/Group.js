// server\models\Group.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
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
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group must have a leader'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
    },
    formationDate: {
      type: Date,
      default: Date.now,
    },
    // Members array for quick lookup of members in a group
    // Members will also have a UserGroupMembership record
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Group financial details (can be stored here or in a separate GroupAccount)
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
    // Group-specific loan/savings rules (can also be pulled from Settings but allows group overrides)
    minMemberSavingsForLoan: { type: Number, default: 200 },
    maxLoanRatioToGroupSavings: { type: Number, default: 0.3 },
    // Reference to a custom group account
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      unique: true, // Each group should have one account
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
groupSchema.index({ leader: 1 });
groupSchema.index({ status: 1 });
// Note: name field already has unique: true which creates an index automatically

module.exports = mongoose.model('Group', groupSchema);
// ========== INSTANCE METHODS ========== //

// // Add a member (limit to 30 members)
// groupSchema.methods.addMember = async function (userId) {
//   if (this.members.includes(userId)) return this;
//   if (this.members.length >= 30) {
//     throw new Error('Group member limit reached (30 members max).');
//   }
//   this.members.push(userId);
//   return await this.save();
// };

// // Remove a member
// groupSchema.methods.removeMember = async function (userId) {
//   this.members = this.members.filter(id => id.toString() !== userId.toString());
//   return await this.save();
// };

// // Get average savings per member
// groupSchema.methods.getAverageSavingsPerMember = function () {
//   const count = this.members.length || 1;
//   return this.totalSavings / count;
// };

// module.exports = mongoose.model('Group', groupSchema);
