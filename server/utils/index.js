const ErrorResponse = require('./errorResponse');
const sendEmail = require('./sendEmail');
const jwt = require('./jwt');
const blacklist = require('./blacklist');
const settingsHelper = require('./settingsHelper');
const currencyUtils = require('./currencyUtils');

// Generate unique account number
const generateAccountNumber = async () => {
  const Account = require('../models/Account');

  // Generate a random 10-digit number
  const generateRandomNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  let accountNumber;
  let isUnique = false;

  // Keep generating until we get a unique account number
  while (!isUnique) {
    accountNumber = generateRandomNumber();

    // Check if this account number already exists
    const existingAccount = await Account.findOne({ accountNumber });
    if (!existingAccount) {
      isUnique = true;
    }
  }

  return accountNumber;
};

module.exports = {
  ErrorResponse,
  sendEmail,
  jwt,
  blacklist,
  settingsHelper,
  currencyUtils,
  generateAccountNumber,
};
