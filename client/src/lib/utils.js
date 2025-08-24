import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string
 * @deprecated Use formatCurrency from utils/formatters.js instead
 */
export function formatCurrency(amount) {
  // Import the proper currency formatter that uses app settings
  const { formatCurrency: formatWithCurrency } = require('../utils/formatters');
  return formatWithCurrency(amount);
}
