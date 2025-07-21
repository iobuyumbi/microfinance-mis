const User = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    const newUser = await User.create({ name, email, password, phone, role });
    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that email" });
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/${resetToken}`;
    const message = `You requested a password reset.\n\nPlease use the following link to reset your password:\n\n${resetUrl}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: message,
    });
    res.status(200).json({ success: true, message: "Reset email sent" });
  } catch (error) {
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};
