const Account = require("../models/Account");

exports.createAccount = async (req, res, next) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

exports.getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    next(err);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};
