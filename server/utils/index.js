const ErrorResponse = require('./errorResponse');
const sendEmail = require('./sendEmail');
const jwt = require('./jwt');
const blacklist = require('./blacklist');
const settingsHelper = require('./settingsHelper');
const currencyUtils = require('./currencyUtils');
const mongoose = require('mongoose');

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

// Run a function within a MongoDB transaction session (ACID across multiple writes)
const withTransaction = async fn => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  ErrorResponse,
  sendEmail,
  jwt,
  blacklist,
  settingsHelper,
  currencyUtils,
  generateAccountNumber,
  withTransaction,
};
