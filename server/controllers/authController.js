const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");
const crypto = require("crypto");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create new user
    const newUser = await User.create({ name, email, password, phone, role });

    // Generate JWT token
    const token = generateToken(newUser);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.log("Welcome email failed to send:", emailError.message);
      // Don't fail the registration if email fails
    }

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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res
        .status(401)
        .json({ success: false, message: "Account is suspended" });
    }

    // Generate JWT token
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
  let user;

  try {
    // Find user by email
    user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with that email" });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    // Clear reset token if email fails
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
};
