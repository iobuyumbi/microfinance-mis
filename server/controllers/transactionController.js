const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

// Create a transaction
exports.createTransaction = async (req, res, next) => {
  try {
    const { amount, type, account, description } = req.body;

    // Basic validation
    if (!amount || !type || !account) {
      return res
        .status(400)
        .json({ error: "Amount, type, and account are required." });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      account,
      description,
    });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

// Get all transactions
exports.getTransactions = async (req, res, next) => {
  try {
    let transactions;
    if (["admin", "officer"].includes(req.user.role)) {
      transactions = await Transaction.find().lean();
    } else {
      const Group = require("../models/Group");
      const userGroups = await Group.find({ members: req.user._id }).distinct("_id");
      transactions = await Transaction.find({ group: { $in: userGroups } }).lean();
    }
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }

    const transaction = await Transaction.findById(id)
      .populate("account")
      .lean();
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

// Update transaction
exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }

    const transaction = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID." });
    }

    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res.status(204).send(); // No content
  } catch (err) {
    next(err);
  }
};
