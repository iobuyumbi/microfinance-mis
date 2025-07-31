// server\routes\authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  checkPublicAccess,
} = require('../controllers/authController');
const { validateRequiredFields } = require('../middleware/validate');
const { protect } = require('../middleware/auth'); // Import the protect middleware

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  validateRequiredFields(['name', 'email', 'password']),
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateRequiredFields(['email', 'password']), login);

// @route   POST /api/auth/logout
// @desc    Logout user (blacklists token)
// @access  Private (requires authentication to know which token to blacklist)
router.post('/logout', protect, logout);

// @route   GET /api/auth/status
// @desc    Check if the public auth endpoint is accessible
// @access  Public
router.get('/status', checkPublicAccess); // <--- NEW ROUTE

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires token)
router.get('/me', protect, getMe);

// @route   POST /api/auth/forgot-password
// @desc    Request a password reset link
// @access  Public
router.post(
  '/forgot-password',
  validateRequiredFields(['email']),
  forgotPassword
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using a reset token
// @access  Public
router.post(
  '/reset-password',
  validateRequiredFields(['token', 'password']),
  resetPassword
);

module.exports = router;
