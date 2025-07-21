const mongoose = require("mongoose");

const guarantorSchema = new mongoose.Schema({
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
  },
  guarantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amountGuaranteed: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

module.exports = mongoose.model("Guarantor", guarantorSchema);
