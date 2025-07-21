// Utils index file - exports all utility functions

const { generateToken, verifyToken, decodeToken } = require("./jwt");
const {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("./sendEmail");

module.exports = {
  // JWT utilities
  generateToken,
  verifyToken,
  decodeToken,

  // Email utilities
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
