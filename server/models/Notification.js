const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Client" if you have a separate model for clients
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel", // supports dynamic references (e.g., Loan, Repayment, etc.)
    },
    referenceModel: {
      type: String,
      enum: ["Loan", "Repayment", "Transaction", "Savings", "Guarantor"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
