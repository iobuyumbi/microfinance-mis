const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      unique: true,
      index: true, // helpful for faster search
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    meetingFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberContributions: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          default: 0,
          min: [0, 'Contribution cannot be negative'],
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalSavings: {
      type: Number,
      default: 0,
      min: [0, 'Total savings cannot be negative'],
    },
    // Custom roles defined by group leaders
    customRoles: [
      {
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
            ],
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
      },
    ],
    // Group settings
    settings: {
      maxLoanAmount: {
        type: Number,
        default: 10000,
        min: [0, 'Max loan amount cannot be negative'],
      },
      minSavingsRequired: {
        type: Number,
        default: 1000,
        min: [0, 'Min savings required cannot be negative'],
      },
      loanInterestRate: {
        type: Number,
        default: 5,
        min: [0, 'Interest rate cannot be negative'],
        max: [100, 'Interest rate cannot exceed 100%'],
      },
    },
  },
  {
    timestamps: true,
  }
);

// ========== INSTANCE METHODS ========== //

// Add a member (limit to 30 members)
groupSchema.methods.addMember = async function (userId) {
  if (this.members.includes(userId)) return this;
  if (this.members.length >= 30) {
    throw new Error('Group member limit reached (30 members max).');
  }
  this.members.push(userId);
  return await this.save();
};

// Remove a member
groupSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter(id => id.toString() !== userId.toString());
  return await this.save();
};

// Get average savings per member
groupSchema.methods.getAverageSavingsPerMember = function () {
  const count = this.members.length || 1;
  return this.totalSavings / count;
};

module.exports = mongoose.model('Group', groupSchema);
