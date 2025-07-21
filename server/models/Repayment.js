const mongoose = require("mongoose");

const repaymentSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: [true, "Loan reference is required"],
    },
    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [1, "Amount paid must be positive"],
    },
    paymentDate: {
      type: Date,
      default: () => Date.now(),
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "mobile", "bank"],
      default: "cash",
    },
    penalty: {
      type: Number,
      default: 0,
      min: [0, "Penalty cannot be negative"],
    },
    remainingBalance: {
      type: Number,
      min: [0, "Remaining balance cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Validate remaining balance
repaymentSchema.pre("save", function (next) {
  if (this.remainingBalance != null && this.remainingBalance < 0) {
    return next(new Error("Remaining balance cannot be negative"));
  }
  next();
});

module.exports = mongoose.model("Repayment", repaymentSchema);
