/**
 * Utility functions for formatting data
 */

// Import FinancialConstants for consistent currency defaults
import { FinancialConstants } from './financialUtils';

// Resolve default currency from settings bootstrap (set in App)
const getDefaultCurrency = () => {
  try {
    const stored = localStorage.getItem("appCurrency");
    if (stored && typeof stored === "string") return stored;
  } catch (_) {}
  return FinancialConstants.DEFAULT_CURRENCY;
};

// Currency formatting with dynamic currency from settings
export const formatCurrency = (amount, currency) => {
  if (amount === null || amount === undefined) return "N/A";
  const cur = currency || getDefaultCurrency() || FinancialConstants.DEFAULT_CURRENCY;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Compact currency formatting (e.g., 1.2K, 1.5M)
export const formatCompactCurrency = (amount, currency) => {
  if (amount === null || amount === undefined) return "N/A";
  const cur = currency || getDefaultCurrency() || FinancialConstants.DEFAULT_CURRENCY;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return formatter.format(amount);
};

// Date formatting with different styles
export const formatDate = (date, format = "medium") => {
  if (!date) return "N/A";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const options = {
    short: { dateStyle: "short" },
    medium: { dateStyle: "medium" },
    long: { dateStyle: "long" },
    full: { dateStyle: "full" },
  };

  return new Intl.DateTimeFormat(
    "en-US",
    options[format] || options.medium
  ).format(dateObj);
};

// Date and time formatting
export const formatDateTime = (date, format = "medium") => {
  if (!date) return "N/A";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const options = {
    short: {
      dateStyle: "short",
      timeStyle: "short",
    },
    medium: {
      dateStyle: "medium",
      timeStyle: "short",
    },
    long: {
      dateStyle: "long",
      timeStyle: "short",
    },
  };

  return new Intl.DateTimeFormat(
    "en-US",
    options[format] || options.medium
  ).format(dateObj);
};

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return "N/A";

  const now = new Date();
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) return "Invalid Date";

  const diff = now - targetDate;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Format number with commas
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("254")) {
    return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(
      9
    )}`;
  }

  return phone; // Return original if no pattern matches
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
