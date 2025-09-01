
const mongoose = require('mongoose');

/**
 * Decimal utility functions for safe financial calculations
 */
class DecimalUtils {
  /**
   * Convert number to Decimal128
   * @param {number|string} value - Value to convert
   * @returns {mongoose.Types.Decimal128}
   */
  static toDecimal(value) {
    if (value === null || value === undefined || value === '') {
      return mongoose.Types.Decimal128.fromString('0');
    }
    
    if (mongoose.Types.Decimal128.isDecimal128(value)) {
      return value;
    }
    
    return mongoose.Types.Decimal128.fromString(String(value));
  }

  /**
   * Convert Decimal128 to number
   * @param {mongoose.Types.Decimal128} decimal - Decimal to convert
   * @returns {number}
   */
  static toNumber(decimal) {
    if (!decimal || !mongoose.Types.Decimal128.isDecimal128(decimal)) {
      return 0;
    }
    return parseFloat(decimal.toString());
  }

  /**
   * Add two decimal values
   * @param {mongoose.Types.Decimal128|number} a
   * @param {mongoose.Types.Decimal128|number} b
   * @returns {mongoose.Types.Decimal128}
   */
  static add(a, b) {
    const numA = this.toNumber(a);
    const numB = this.toNumber(b);
    return this.toDecimal(numA + numB);
  }

  /**
   * Subtract two decimal values
   * @param {mongoose.Types.Decimal128|number} a
   * @param {mongoose.Types.Decimal128|number} b
   * @returns {mongoose.Types.Decimal128}
   */
  static subtract(a, b) {
    const numA = this.toNumber(a);
    const numB = this.toNumber(b);
    return this.toDecimal(numA - numB);
  }

  /**
   * Multiply two decimal values
   * @param {mongoose.Types.Decimal128|number} a
   * @param {mongoose.Types.Decimal128|number} b
   * @returns {mongoose.Types.Decimal128}
   */
  static multiply(a, b) {
    const numA = this.toNumber(a);
    const numB = this.toNumber(b);
    return this.toDecimal(numA * numB);
  }

  /**
   * Divide two decimal values
   * @param {mongoose.Types.Decimal128|number} a
   * @param {mongoose.Types.Decimal128|number} b
   * @returns {mongoose.Types.Decimal128}
   */
  static divide(a, b) {
    const numA = this.toNumber(a);
    const numB = this.toNumber(b);
    if (numB === 0) {
      throw new Error('Division by zero');
    }
    return this.toDecimal(numA / numB);
  }

  /**
   * Calculate percentage
   * @param {mongoose.Types.Decimal128|number} amount
   * @param {mongoose.Types.Decimal128|number} percentage
   * @returns {mongoose.Types.Decimal128}
   */
  static percentage(amount, percentage) {
    const numAmount = this.toNumber(amount);
    const numPercentage = this.toNumber(percentage);
    return this.toDecimal((numAmount * numPercentage) / 100);
  }

  /**
   * Compare two decimal values
   * @param {mongoose.Types.Decimal128|number} a
   * @param {mongoose.Types.Decimal128|number} b
   * @returns {number} -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compare(a, b) {
    const numA = this.toNumber(a);
    const numB = this.toNumber(b);
    
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  }

  /**
   * Format decimal for display
   * @param {mongoose.Types.Decimal128} decimal
   * @param {string} currency - Currency symbol
   * @param {number} decimals - Number of decimal places
   * @returns {string}
   */
  static format(decimal, currency = 'KES', decimals = 2) {
    const number = this.toNumber(decimal);
    return `${currency} ${number.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }
}

module.exports = DecimalUtils;
