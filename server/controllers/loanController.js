const Loan = require("../models/Loan");
const Group = require("../models/Group");
const User = require("../models/User");

// Apply for a loan
const applyForLoan = async (req, res, next) => {
  try {
    const { borrower, borrowerModel, amountRequested, interestRate, loanTerm } =
      req.body;

    if (!["User", "Group"].includes(borrowerModel)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid borrowerModel" });
    }

    if (req.user.role === "leader") {
      if (
        (borrowerModel === "User" && borrower !== req.user._id.toString()) ||
        (borrowerModel === "Group" &&
          !(await Group.exists({ _id: borrower, members: req.user._id })))
      ) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }
    const loan = await Loan.create({
      borrower,
      borrowerModel,
      amountRequested,
      interestRate,
      loanTerm,
      status: "pending",
    });
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Get all loans (admin/officer see all, others see theirs/groups)
const getAllLoans = async (req, res, next) => {
  try {
    let loans;

    if (["admin", "officer"].includes(req.user.role)) {
      loans = await Loan.find();
    } else {
      const userGroups = await Group.find({ members: req.user._id }).distinct(
        "_id"
      );

      loans = await Loan.find({
        $or: [
          { borrowerModel: "User", borrower: req.user._id },
          { borrowerModel: "Group", borrower: { $in: userGroups } },
        ],
      });
    }
    res.status(200).json({ success: true, count: loans.length, data: loans });
  } catch (error) {
    next(error);
  }
};

// Get a single loan by ID with access control
const getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    const isUserBorrower =
      loan.borrowerModel === "User" &&
      loan.borrower.toString() === req.user._id.toString();

    const isGroupBorrower =
      loan.borrowerModel === "Group" &&
      (await Group.exists({ _id: loan.borrower, members: req.user._id }));

    if (
      !["admin", "officer"].includes(req.user.role) &&
      !isUserBorrower &&
      !isGroupBorrower
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Approve or update loan status/schedule (admin/officer only)
const approveLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    if (!["admin", "officer"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, amountApproved, repaymentSchedule } = req.body;

    if (status) loan.status = status;
    if (amountApproved) loan.amountApproved = amountApproved;
    if (repaymentSchedule) loan.repaymentSchedule = repaymentSchedule;
    loan.approver = req.user._id;
    await loan.save();
    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Update loan request (only pending + access-controlled)
const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    if (loan.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending loans can be updated" });
    }

    const isUserBorrower =
      loan.borrowerModel === "User" &&
      loan.borrower.toString() === req.user._id.toString();

    const isGroupBorrower =
      loan.borrowerModel === "Group" &&
      (await Group.exists({ _id: loan.borrower, members: req.user._id }));

    if (
      !["admin", "officer"].includes(req.user.role) &&
      !isUserBorrower &&
      !isGroupBorrower
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const fieldsToUpdate = ["amountRequested", "interestRate", "loanTerm"];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        loan[field] = req.body[field];
      }
    });

    await loan.save();

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// Delete a loan (admin/officer only)
const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    res.status(200).json({ success: true, message: "Loan deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForLoan,
  getAllLoans,
  getLoanById,
  approveLoan,
  updateLoan,
  deleteLoan,
};
