const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { validateRequiredFields } = require("../middleware/validate");
const { protect } = require("../middleware/auth");

// Auth routes
router.post(
  "/register",
  validateRequiredFields(["name", "email", "password"]),
  register
);
router.post("/login", validateRequiredFields(["email", "password"]), login);
router.get("/me", protect, getMe);
router.post(
  "/forgot-password",
  validateRequiredFields(["email"]),
  forgotPassword
);
router.post(
  "/reset-password",
  validateRequiredFields(["token", "password"]),
  resetPassword
);

module.exports = router;
