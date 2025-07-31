/**
 * Validation utility functions
 */

// Email validation
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Phone validation (supports international formats)
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid length (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
};

// Password strength validation
export const getPasswordStrength = (password) => {
  if (!password || typeof password !== "string") return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character type checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 5);
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
  const labels = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
    5: "Very Strong",
  };

  return labels[strength] || "Very Weak";
};

// Get password strength color
export const getPasswordStrengthColor = (strength) => {
  const colors = {
    0: "text-red-500",
    1: "text-red-500",
    2: "text-yellow-500",
    3: "text-blue-500",
    4: "text-green-500",
    5: "text-green-600",
  };

  return colors[strength] || "text-red-500";
};

// Required field validation
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Minimum length validation
export const hasMinLength = (value, minLength) => {
  if (!value || typeof value !== "string") return false;
  return value.trim().length >= minLength;
};

// Maximum length validation
export const hasMaxLength = (value, maxLength) => {
  if (!value || typeof value !== "string") return false;
  return value.trim().length <= maxLength;
};

// Numeric validation
export const isNumeric = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(value) && !isNaN(parseFloat(value));
};

// Positive number validation
export const isPositiveNumber = (value) => {
  if (!isNumeric(value)) return false;
  return parseFloat(value) > 0;
};

// Non-negative number validation
export const isNonNegativeNumber = (value) => {
  if (!isNumeric(value)) return false;
  return parseFloat(value) >= 0;
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Future date validation
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;

  const dateObj = new Date(date);
  const now = new Date();

  return dateObj > now;
};

// Past date validation
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;

  const dateObj = new Date(date);
  const now = new Date();

  return dateObj < now;
};

// Age validation
export const isValidAge = (birthDate, minAge = 18, maxAge = 100) => {
  if (!isValidDate(birthDate)) return false;

  const birth = new Date(birthDate);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age >= minAge && age <= maxAge;
};

// National ID validation (Kenya format)
export const isValidNationalID = (nationalId) => {
  if (!nationalId || typeof nationalId !== "string") return false;

  // Remove spaces and dashes
  const cleaned = nationalId.replace(/[\s-]/g, "");

  // Check if it's exactly 8 digits
  return /^\d{8}$/.test(cleaned);
};

// Account number validation
export const isValidAccountNumber = (accountNumber) => {
  if (!accountNumber || typeof accountNumber !== "string") return false;

  // Remove spaces and dashes
  const cleaned = accountNumber.replace(/[\s-]/g, "");

  // Check if it's alphanumeric and reasonable length
  return /^[A-Z0-9]{8,20}$/.test(cleaned);
};

// Amount validation
export const isValidAmount = (amount, minAmount = 0) => {
  if (!isNumeric(amount)) return false;

  const numAmount = parseFloat(amount);
  return numAmount >= minAmount && numAmount <= 999999999.99;
};

// Percentage validation
export const isValidPercentage = (percentage) => {
  if (!isNumeric(percentage)) return false;

  const numPercentage = parseFloat(percentage);
  return numPercentage >= 0 && numPercentage <= 100;
};

// URL validation
export const isValidURL = (url) => {
  if (!url || typeof url !== "string") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// File size validation
export const isValidFileSize = (file, maxSizeMB = 5) => {
  if (!file || !file.size) return false;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// File type validation
export const isValidFileType = (
  file,
  allowedTypes = ["image/jpeg", "image/png", "image/gif"]
) => {
  if (!file || !file.type) return false;

  return allowedTypes.includes(file.type);
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber || typeof cardNumber !== "string") return false;

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Check if it's all digits and reasonable length
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    // Required validation
    if (fieldRules.required && !isRequired(value)) {
      errors[field] = `${field} is required`;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!isRequired(value)) return;

    // Email validation
    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = "Please enter a valid email address";
      return;
    }

    // Phone validation
    if (fieldRules.phone && !isValidPhone(value)) {
      errors[field] = "Please enter a valid phone number";
      return;
    }

    // Min length validation
    if (fieldRules.minLength && !hasMinLength(value, fieldRules.minLength)) {
      errors[field] =
        `${field} must be at least ${fieldRules.minLength} characters`;
      return;
    }

    // Max length validation
    if (fieldRules.maxLength && !hasMaxLength(value, fieldRules.maxLength)) {
      errors[field] =
        `${field} must be no more than ${fieldRules.maxLength} characters`;
      return;
    }

    // Numeric validation
    if (fieldRules.numeric && !isNumeric(value)) {
      errors[field] = `${field} must be a number`;
      return;
    }

    // Positive number validation
    if (fieldRules.positive && !isPositiveNumber(value)) {
      errors[field] = `${field} must be a positive number`;
      return;
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, values);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });

  return errors;
};
