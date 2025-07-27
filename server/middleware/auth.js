const { verifyToken } = require('../utils/jwt');
const { isBlacklisted } = require('../utils/blacklist');
const User = require('../models/User');

// Protect routes - verify token and attach user to request
exports.protect = async (req, res, next) => {
  try {
    console.log('Auth middleware - headers:', req.headers.authorization);

    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Token extracted:', token ? 'present' : 'missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // ❗ Check if the token is blacklisted
    if (isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: 'This token has been revoked. Please log in again.',
      });
    }

    // Verify token using utils
    const decoded = verifyToken(token);
    console.log('Token decoded:', decoded);

    const user = await User.findById(decoded.id).select('-password');
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Authentication failed.',
      });
    }

    req.user = user;
    console.log('User attached to req:', req.user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// Role-based access control middleware (alias: authorize)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

// Optional authentication: attaches user if token is present, but does not fail if missing/invalid
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Ignore invalid token, proceed unauthenticated
    }
  }
  next();
};
