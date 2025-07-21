const Savings = require("../models/Savings");

// Create new savings record
exports.createSavings = async (req, res, next) => {
  try {
    const savings = new Savings(req.body);
    await savings.save();
    res.status(201).json({ success: true, data: savings });
  } catch (error) {
    next(error);
  }
};

// Get all savings records
exports.getSavings = async (req, res, next) => {
  try {
    const savings = await Savings.find();
    res.status(200).json({ success: true, data: savings });
  } catch (error) {
    next(error);
  }
};

// Get a single savings record by ID
exports.getSavingsById = async (req, res, next) => {
  try {
    const savings = await Savings.findById(req.params.id);
    if (!savings) {
      return res
        .status(404)
        .json({ success: false, error: "Savings not found" });
    }
    res.status(200).json({ success: true, data: savings });
  } catch (error) {
    next(error);
  }
};

// Update a savings record
exports.updateSavings = async (req, res, next) => {
  try {
    const savings = await Savings.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!savings) {
      return res
        .status(404)
        .json({ success: false, error: "Savings not found" });
    }
    res.status(200).json({ success: true, data: savings });
  } catch (error) {
    next(error);
  }
};

// Delete a savings record
exports.deleteSavings = async (req, res, next) => {
  try {
    const savings = await Savings.findByIdAndDelete(req.params.id);
    if (!savings) {
      return res
        .status(404)
        .json({ success: false, error: "Savings not found" });
    }
    res.status(200).json({ success: true, message: "Savings deleted" });
  } catch (error) {
    next(error);
  }
};
