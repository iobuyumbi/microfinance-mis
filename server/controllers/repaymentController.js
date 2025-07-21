const Repayment = require("../models/Repayment");
const Loan = require("../models/Loan");
const Group = require("../models/Group");

// 🔒 Helper: Check if user can access a given loan
const hasLoanAccess = async (loan, user) => {
  if (["admin", "officer"].includes(user.role)) return true;

  if (loan.borrowerModel === "User" && loan.borrower.equals(user._id)) {
    return true;
  }

  if (loan.borrowerModel === "Group") {
    const group = await Group.findById(loan.borrower);
    return group?.members.includes(user._id);
  }

  return false;
};

// 📌 Create a new repayment
exports.recordRepayment = async (req, res, next) => {
  try {
    const {
      loanId,
      amountPaid,
      paymentDate,
      paymentMethod,
      penalty,
      remainingBalance,
    } = req.body;

    if (!loanId || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: "Loan ID and amountPaid are required",
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    if (!(await hasLoanAccess(loan, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const repayment = await Repayment.create({
      loan: loanId,
      amountPaid,
      paymentDate,
      paymentMethod,
      penalty,
      remainingBalance,
    });
    res.status(201).json({ success: true, data: repayment });
  } catch (error) {
    next(error);
  }
};

// 📌 Get all repayments (filtered by user access)
exports.getAllRepayments = async (req, res, next) => {
  try {
    let repayments;

    if (["admin", "officer"].includes(req.user.role)) {
      repayments = await Repayment.find();
    } else {
      const userLoanIds = await Loan.find({
        borrower: req.user._id,
        borrowerModel: "User",
      }).distinct("_id");
      const groupIds = await Group.find({ members: req.user._id }).distinct(
        "_id"
      );
      const groupLoanIds = await Loan.find({
        borrower: { $in: groupIds },
        borrowerModel: "Group",
      }).distinct("_id");

      const allLoanIds = [...userLoanIds, ...groupLoanIds];

      repayments = await Repayment.find({ loan: { $in: allLoanIds } });
    }

    res.status(200).json({
      success: true,
      count: repayments.length,
      data: repayments,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Get all repayments for a specific loan
exports.getRepaymentsByLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });
    }

    if (!(await hasLoanAccess(loan, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const repayments = await Repayment.find({ loan: req.params.loanId });

    res.status(200).json({
      success: true,
      count: repayments.length,
      data: repayments,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Get a specific repayment by ID
exports.getRepaymentById = async (req, res, next) => {
  try {
    const repayment = await Repayment.findById(req.params.id);
    if (!repayment) {
      return res
        .status(404)
        .json({ success: false, message: "Repayment not found" });
    }
    const loan = await Loan.findById(repayment.loan);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Associated loan not found" });
    }

    if (!(await hasLoanAccess(loan, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: repayment });
  } catch (error) {
    next(error);
  }
};

// 📌 Delete a repayment
exports.deleteRepayment = async (req, res, next) => {
  try {
    const repayment = await Repayment.findById(req.params.id);
    if (!repayment) {
      return res
        .status(404)
        .json({ success: false, message: "Repayment not found" });
    }

    const loan = await Loan.findById(repayment.loan);
    if (!loan) {
      return res
        .status(404)
        .json({ success: false, message: "Associated loan not found" });
    }

    if (!(await hasLoanAccess(loan, req.user))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await repayment.deleteOne();

    res.status(200).json({
      success: true,
      message: "Repayment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
