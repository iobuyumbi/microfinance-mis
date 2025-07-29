// server\controllers\authController.js

const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('../utils/sendEmail');
const blacklist = require('../utils/blacklist');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse'); // Import custom error class

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  // Added next for ErrorResponse
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already exists.', 400));
  }

  // CRITICAL SECURITY: Prevent direct assignment of 'admin' or 'officer' roles during registration.
  // New users should default to 'member' or a 'pending' role.
  let userRole = 'member'; // Default role for new registrations
  if (role && ['admin', 'officer', 'leader'].includes(role.toLowerCase())) {
    // Log this attempt, or return an error if you want to be strict
    console.warn(
      `Attempt to register user with privileged role: ${role} for email: ${email}. Defaulting to 'member'.`
    );
    // Optionally: return next(new ErrorResponse('Cannot register with a privileged role.', 403));
  }
  // If the 'role' field is passed, and it's not a privileged role, allow it (e.g., 'member')
  if (role && ['member'].includes(role.toLowerCase())) {
    userRole = role.toLowerCase();
  }

  const user = await User.create({ name, email, password, role: userRole });

  // Send welcome email (async, doesn't block response)
  // Wrap in try-catch to prevent email sending failures from breaking registration
  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (emailError) {
    console.error(`Failed to send welcome email to ${user.email}:`, emailError);
    // Decide if you want to rollback user creation or just log the error
    // For now, we'll proceed but log, as email sending might be flaky.
  }

  const token = generateToken(user._id);

  // Return a more comprehensive user object for the client
  res.status(201).json({
    success: true,
    message:
      'User registered successfully. Welcome email sent (if configured).',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      groupRoles: user.groupRoles, // Include group roles
      permissions: user.permissions, // Include global permissions
      // Do NOT include password or sensitive hash
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password are provided
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide an email and password.', 400)
    );
  }

  const user = await User.findOne({ email }).select('+password'); // Select password for comparison

  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials.', 401)); // Generic message for security
  }

  // Check if user account is active
  if (user.status !== 'active') {
    return next(
      new ErrorResponse(
        `Your account status is '${user.status}'. Please contact support.`,
        403
      )
    );
  }

  const token = generateToken(user._id);

  // Return a more comprehensive user object for the client
  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      groupRoles: user.groupRoles, // Include group roles
      permissions: user.permissions, // Include global permissions
      // Do NOT include password or sensitive hash
    },
  });
});

// @desc    Logout user (blacklist token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler((req, res, next) => {
  // Added next
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (token) {
    blacklist.add(token);
  } else {
    // If no token is provided but logout is attempted, might be an issue
    return next(new ErrorResponse('No token provided for logout.', 400));
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// @desc    Forgot password - send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address.', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Send generic success message even if email not found to prevent user enumeration
    return res.status(200).json({
      success: true,
      message:
        'If a user with that email exists, a password reset link has been sent.',
    });
  }

  // Generate a reset token that expires
  // It's generally better to use a dedicated reset token that is hashed and stored on the user model,
  // and invalidated after use, rather than a JWT for password resets.
  // For this setup, we'll continue with JWT but acknowledge the alternative.
  const resetToken = generateToken(user._id, '15m'); // 15 minutes validity

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({
      success: true,
      message:
        'If a user with that email exists, a password reset link has been sent.',
    });
  } catch (emailError) {
    console.error(
      `Error sending password reset email to ${email}:`,
      emailError
    );
    return next(
      new ErrorResponse('Email could not be sent. Please try again later.', 500)
    );
  }
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(new ErrorResponse('Token and new password are required.', 400));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(new ErrorResponse('Invalid or expired reset token.', 400));
  }

  // Check if the token is blacklisted (if a JWT is used for reset tokens)
  if (blacklist.has(token)) {
    return next(
      new ErrorResponse(
        'This reset link has already been used or is invalid.',
        400
      )
    );
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token.', 400));
  }

  // Update password and blacklist the token to prevent reuse
  user.password = password; // Mongoose pre-save hook will hash this
  await user.save();
  blacklist.add(token); // Invalidate the used reset token

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.',
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  const user = req.user;

  // We can also fetch the user again to ensure all latest data is included,
  // and populate groupRoles if needed, though protect middleware already fetches it.
  // For simplicity, directly using req.user is fine if it's kept up-to-date.
  const fullUser = await User.findById(user._id)
    .select('-password') // Ensure password is never sent
    .populate('groupRoles.groupId', 'name'); // Populate group names

  if (!fullUser) {
    // This case should ideally not happen if protect middleware works correctly
    return next(new ErrorResponse('User data not found.', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      _id: fullUser._id,
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      status: fullUser.status,
      groupRoles: fullUser.groupRoles,
      permissions: fullUser.permissions,
      // Add any other user-specific fields you want the client to have
    },
  });
});
