const mongoose = require("mongoose");

const accountHistorySchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    transactionType: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "loan-disbursement",
        "repayment",
        "adjustment",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Could also be "Admin" depending on your system
    },
  },
  {
    timestamps: true, // includes createdAt
  }
);

module.exports = mongoose.model("AccountHistory", accountHistorySchema);
