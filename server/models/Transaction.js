const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "repayment", "loan_disbursement"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

module.exports = mongoose.model("Transaction", transactionSchema);
