// server\controllers\healthController.js
const asyncHandler = require('../middleware/asyncHandler'); // Assuming you have this for consistency

// @desc    Check backend server health
// @route   GET /api/health
// @access  Public
exports.checkHealth = asyncHandler(async (req, res, next) => {
  // In a more complex scenario, you might check database connection,
  // external service connections, etc., here.
  // For a basic health check, simply returning a 200 OK is sufficient.
  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly.',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(), // Server uptime in seconds
    timestamp: new Date().toISOString(),
  });
});
