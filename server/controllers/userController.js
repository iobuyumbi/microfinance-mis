const User = require("../models/User");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Only allow admin, officer, or the user themselves
    if (
      req.user.role !== "admin" &&
      req.user.role !== "officer" &&
      req.user.id !== user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    // Prevent role/status change via this endpoint
    delete updates.role;
    delete updates.status;
    delete updates.password; // Password change should be separate

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRoleStatus = async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (role) user.role = role;
    if (status) user.status = status;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
