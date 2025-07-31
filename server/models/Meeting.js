// server\models\Meeting.js (REVISED for soft delete fields)
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    // Group association
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group reference is required'],
      index: true,
    }, // Meeting details

    date: {
      type: Date,
      required: [true, 'Meeting date is required'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    agenda: {
      type: String,
      trim: true,
      maxlength: [500, 'Agenda cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      required: true,
      index: true,
    }, // Participants and outcomes

    attendance: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    ],
    resolutions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolutions cannot exceed 1000 characters'],
    }, // Loans discussed (if any)

    loansDiscussed: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', index: true },
    ],

    // --- ADD THESE FIELDS FOR SOFT DELETE ---
    deleted: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering out deleted meetings
    },
    deletedAt: {
      type: Date,
    },
    // ----------------------------------------
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for attendance count
meetingSchema.virtual('attendanceCount').get(function () {
  return this.attendance.length;
});

// Method to mark attendance safely (avoids ObjectId mismatch)
// This method ensures uniqueness by checking before pushing.
// It does NOT throw an error if the user is already present; it simply doesn't add them again.
meetingSchema.methods.markAttendance = function (userId) {
  const idStr = userId.toString();
  if (!this.attendance.some(id => id.toString() === idStr)) {
    this.attendance.push(userId);
  }
  return this.save(); // Returns a promise
};

module.exports = mongoose.model('Meeting', meetingSchema);
