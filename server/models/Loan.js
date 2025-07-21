const mongoose = require("mongoose");

// Embedded schema for each repayment installment
const repaymentScheduleSchema = new mongoose.Schema(
  {
    dueDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Installment amount must be positive"],
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAt: { type: Date },
    method: {
      type: String,
      enum: ["cash", "mobile", "bank"],
      default: "mobile",
    },
  },
  {
    _id: false, // Prevents creation of an _id for each subdocument
  }
);

// Main Loan schema
const loanSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "borrowerModel", // Supports dynamic referencing (User or Group)
      required: true,
    },
    borrowerModel: {
      type: String,
      enum: ["User", "Group"],
      required: true,
    },
    amountRequested: {
      type: Number,
      required: [true, "Requested amount is required"],
      min: [10, "Minimum loan amount is 10"],
    },
    amountApproved: {
      type: Number,
      min: [0, "Approved amount cannot be negative"],
    },
    interestRate: {
      type: Number,
      default: 10,
      min: [0, "Interest rate cannot be negative"],
      max: [100, "Interest rate cannot exceed 100"],
    },
    loanTerm: {
      type: Number, // In months
      required: [true, "Loan term is required"],
      min: [1, "Loan term must be at least 1 month"],
      max: [60, "Loan term cannot exceed 60 months"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      required: true,
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    repaymentSchedule: [repaymentScheduleSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// 🔍 Instance method to calculate total outstanding (unpaid) balance
loanSchema.methods.getOutstandingBalance = function () {
  if (!this.repaymentSchedule?.length) return 0;
  return this.repaymentSchedule
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);
};

module.exports = mongoose.model("Loan", loanSchema);
