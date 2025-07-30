// server\models\Guarantor.js
const mongoose = require('mongoose');

const guarantorSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true, // Already indexed
    },
    guarantor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Already indexed
    },
    amountGuaranteed: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedAt: Date, // When was the guarantee approved/rejected
    rejectedAt: Date, // If rejected
    approvedBy: {
      // Who approved/rejected it (e.g., a Group Leader or Officer)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    revokedAt: Date, // <<< ADD THIS FIELD
    revokedBy: {
      // <<< ADD THIS FIELD
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Already has timestamps
  }
);

module.exports = mongoose.model('Guarantor', guarantorSchema);
