const mongoose = require("mongoose");

const savingsSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "memberModel",
    required: true,
  },
  memberModel: {
    type: String,
    enum: ["User", "Group"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ["cash", "mobile", "bank"],
    default: "cash",
  },
});

module.exports = mongoose.model("Savings", savingsSchema);
