// controllers/authController.js

const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('../utils/sendEmail');
const blacklist = require('../utils/blacklist');
const asyncHandler = require('../middleware/asyncHandler');

// Register a new user
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already exists.');
  }

  const user = await User.create({ name, email, password, role });

  await sendWelcomeEmail(user.email, user.name);
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// Logout user (blacklist token)
exports.logout = asyncHandler((req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (token) {
    blacklist.add(token);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// Forgot password - send reset link
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No user found with that email.');
  }

  const resetToken = generateToken(user._id, '10m');
  await sendPasswordResetEmail(email, resetToken);

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to your email.',
  });
});

// Reset password using token
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token.');
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
});

// Get current logged-in user
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
