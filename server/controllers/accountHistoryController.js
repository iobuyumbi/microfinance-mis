const AccountHistory = require("../models/AccountHistory");

exports.createAccountHistory = async (req, res, next) => {
  try {
    const history = await AccountHistory.create(req.body);
    res.status(201).json(history);
  } catch (err) {
    next(err);
  }
};

exports.getAccountHistories = async (req, res, next) => {
  try {
    let histories;
    if (["admin", "officer"].includes(req.user.role)) {
      histories = await AccountHistory.find();
    } else {
      const Group = require("../models/Group");
      const userGroups = await Group.find({ members: req.user._id }).distinct("_id");
      histories = await AccountHistory.find({ owner: { $in: userGroups }, ownerModel: "Group" });
    }
    res.json(histories);
  } catch (err) {
    next(err);
  }
};

exports.getAccountHistoryById = async (req, res, next) => {
  try {
    const history = await AccountHistory.findById(req.params.id);
    if (!history)
      return res.status(404).json({ error: "Account history not found" });
    res.json(history);
  } catch (err) {
    next(err);
  }
};

exports.updateAccountHistory = async (req, res, next) => {
  try {
    const history = await AccountHistory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!history)
      return res.status(404).json({ error: "Account history not found" });
    res.json(history);
  } catch (err) {
    next(err);
  }
};

exports.deleteAccountHistory = async (req, res, next) => {
  try {
    const history = await AccountHistory.findByIdAndDelete(req.params.id);
    if (!history)
      return res.status(404).json({ error: "Account history not found" });
    res.json({ message: "Account history deleted" });
  } catch (err) {
    next(err);
  }
};
