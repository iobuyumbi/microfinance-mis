const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    memberName: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    principal: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0, 'Principal cannot be negative'],
    },
    june: {
      type: Number,
      default: 0,
      min: [0, 'June contribution cannot be negative'],
    },
    july: {
      type: Number,
      default: 0,
      min: [0, 'July contribution cannot be negative'],
    },
    august: {
      type: Number,
      default: 0,
      min: [0, 'August contribution cannot be negative'],
    },
    december: {
      type: Number,
      default: 0,
      min: [0, 'December contribution cannot be negative'],
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },
    year: {
      type: String,
      enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', ''],
      default: '',
    },
    period: {
      type: String,
      enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', ''],
      default: '',
    },
    actualContribution: {
      type: Number,
      default: 0,
      min: [0, 'Actual contribution cannot be negative'],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Member ID is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total before saving
contributionSchema.pre('save', function (next) {
  this.total = this.june + this.july + this.august + this.december;
  next();
});

// Virtual for formatted amounts
contributionSchema.virtual('formattedPrincipal').get(function () {
  return this.principal.toFixed(2);
});

contributionSchema.virtual('formattedTotal').get(function () {
  return this.total.toFixed(2);
});

contributionSchema.virtual('formattedActualContribution').get(function () {
  return this.actualContribution.toFixed(2);
});

// Index for efficient queries
contributionSchema.index({ groupId: 1, memberId: 1 });
contributionSchema.index({ year: 1, period: 1 });
contributionSchema.index({ memberName: 'text' });

module.exports = mongoose.model('Contribution', contributionSchema);
