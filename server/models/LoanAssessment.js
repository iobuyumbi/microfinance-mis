// server\models\LoanAssessment.js
const mongoose = require('mongoose');

// Function to get currency from Settings (to avoid hardcoding)
let appSettings = null;
async function getCurrency() {
  if (!appSettings) {
    const Settings =
      mongoose.models.Settings ||
      mongoose.model('Settings', require('./Settings').schema);
    appSettings = await Settings.findById('app_settings');
    if (!appSettings) {
      console.warn('Settings document not found. Using default currency USD.');
      appSettings = { general: { currency: 'USD' } }; // Fallback
    }
  }
  return appSettings.general.currency;
}

const loanAssessmentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Added index
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true, // Added index
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Added index
    },
    // Financial data at time of assessment
    individualSavings: {
      type: Number,
      required: true,
      min: 0,
    },
    groupTotalSavings: {
      type: Number,
      required: true,
      min: 0,
    },
    // Assessment criteria (can pull defaults from Settings, but stored here for historical accuracy)
    assessmentRules: {
      minGroupSavings: {
        type: Number,
        default: 1000,
        min: 0,
      },
      minIndividualSavings: {
        type: Number,
        default: 200,
        min: 0,
      },
      maxLoanToGroupSavingsRatio: {
        type: Number,
        default: 0.3,
        min: 0,
        max: 1,
      },
      maxLoanToIndividualSavingsRatio: {
        type: Number,
        default: 2,
        min: 0,
      },
      minLoanAmount: {
        type: Number,
        default: 500,
        min: 0,
      },
      maxLoanAmount: {
        type: Number,
        default: 10000,
        min: 0,
      },
    },
    // Assessment results
    eligible: {
      type: Boolean,
      required: true,
    },
    recommendedAmount: {
      type: Number,
      min: 0,
    },
    maxEligibleAmount: {
      type: Number,
      min: 0,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    reasons: [
      {
        type: String,
        trim: true,
      },
    ],
    // Assessment notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // Assessment status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    // Expiry date for assessment
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
loanAssessmentSchema.index({ member: 1, createdAt: -1 });
loanAssessmentSchema.index({ group: 1, createdAt: -1 });
loanAssessmentSchema.index({ assessedBy: 1, createdAt: -1 });
loanAssessmentSchema.index({ status: 1, expiresAt: 1 });

// Virtual for formatted amounts (now dynamic)
loanAssessmentSchema
  .virtual('formattedIndividualSavings')
  .get(async function () {
    const currency = await getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.individualSavings);
  });

loanAssessmentSchema
  .virtual('formattedGroupTotalSavings')
  .get(async function () {
    const currency = await getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.groupTotalSavings);
  });

loanAssessmentSchema
  .virtual('formattedRecommendedAmount')
  .get(async function () {
    if (this.recommendedAmount == null) return 'N/A';
    const currency = await getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.recommendedAmount);
  });

loanAssessmentSchema
  .virtual('formattedMaxEligibleAmount')
  .get(async function () {
    if (this.maxEligibleAmount == null) return 'N/A';
    const currency = await getCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(this.maxEligibleAmount);
  });

// Virtual for assessment age
loanAssessmentSchema.virtual('ageInDays').get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Virtual for expiry status
loanAssessmentSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Pre-save middleware to calculate assessment results
loanAssessmentSchema.pre('save', function (next) {
  // Only recalculate if key fields are modified or it's a new document
  if (
    this.isModified('individualSavings') ||
    this.isModified('groupTotalSavings') ||
    this.isNew
  ) {
    // Calculate max eligible amount
    const maxFromGroupSavings =
      this.groupTotalSavings * this.assessmentRules.maxLoanToGroupSavingsRatio;
    const maxFromIndividualSavings =
      this.individualSavings *
      this.assessmentRules.maxLoanToIndividualSavingsRatio;
    this.maxEligibleAmount = Math.min(
      maxFromGroupSavings,
      maxFromIndividualSavings,
      this.assessmentRules.maxLoanAmount
    );

    // Check eligibility
    this.reasons = [];

    if (this.groupTotalSavings < this.assessmentRules.minGroupSavings) {
      this.reasons.push(
        `Group savings (${this.groupTotalSavings}) is below minimum requirement (${this.assessmentRules.minGroupSavings})`
      );
    }

    if (this.individualSavings < this.assessmentRules.minIndividualSavings) {
      this.reasons.push(
        `Individual savings (${this.individualSavings}) is below minimum requirement (${this.assessmentRules.minIndividualSavings})`
      );
    }

    // Determine eligibility
    this.eligible =
      this.reasons.length === 0 &&
      this.maxEligibleAmount >= this.assessmentRules.minLoanAmount;

    // Set recommended amount (conservative approach)
    if (this.eligible) {
      this.recommendedAmount = Math.min(
        this.maxEligibleAmount,
        this.assessmentRules.maxLoanAmount
      ); // Use rule max, not hardcoded 5000
    } else {
      this.recommendedAmount = 0; // If not eligible, recommend 0
    }

    // Determine risk level
    if (this.groupTotalSavings > 5000 && this.individualSavings > 1000) {
      this.riskLevel = 'low';
    } else if (this.groupTotalSavings > 2000 && this.individualSavings > 500) {
      this.riskLevel = 'medium';
    } else {
      this.riskLevel = 'high';
    }
  }
  next();
});

module.exports = mongoose.model('LoanAssessment', loanAssessmentSchema);
