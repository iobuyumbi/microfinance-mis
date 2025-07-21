const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      unique: true,
      index: true, // helpful for faster search
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    meetingFrequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly"],
      default: "monthly",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberContributions: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          default: 0,
          min: [0, "Contribution cannot be negative"],
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
      min: [0, "Total savings cannot be negative"],
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
    throw new Error("Group member limit reached (30 members max).");
  }
  this.members.push(userId);
  return await this.save();
};

// Remove a member
groupSchema.methods.removeMember = async function (userId) {
  this.members = this.members.filter(
    (id) => id.toString() !== userId.toString()
  );
  return await this.save();
};

// Get average savings per member
groupSchema.methods.getAverageSavingsPerMember = function () {
  const count = this.members.length || 1;
  return this.totalSavings / count;
};

module.exports = mongoose.model("Group", groupSchema);
