// Utils index file - exports all utility functions

const { generateToken, verifyToken, decodeToken } = require('./jwt');
const {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require('./sendEmail');

const { addToBlacklist, isBlacklisted } = require('../blacklist');

module.exports = {
  // JWT utilities
  generateToken,
  verifyToken,
  decodeToken,

  // Email utilities
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,

  // Blacklist utilities
  addToBlacklist,
  isBlacklisted,
};
