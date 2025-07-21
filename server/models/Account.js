const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "ownerModel",
      required: true,
    },
    ownerModel: {
      type: String,
      enum: ["User", "Group"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    accountType: {
      type: String,
      enum: ["savings", "loan", "general"],
      default: "savings",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);
