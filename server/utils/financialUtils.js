// server\utils\financialUtils.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('./currencyUtils');

/**
 * Utility function to create a financial transaction with proper validation and account updates
 * This centralizes transaction creation logic to ensure consistency across different modules
 *
 * @param {Object} transactionData - Transaction data including type, amount, description, etc.
 * @param {Object} options - Additional options for transaction processing
 * @returns {Promise<Object>} - The created transaction and updated account
 */
async function createFinancialTransaction(transactionData, options = {}) {
  const { skipBalanceUpdate = false, session: existingSession } = options;

  // Dynamically import models to avoid circular dependencies
  const Transaction =
    mongoose.models.Transaction || require('../models/Transaction');
  const Account = mongoose.models.Account || require('../models/Account');

  // Use existing session or create new one
  const session = existingSession || (await mongoose.startSession());
  const shouldCommit = !existingSession;

  if (shouldCommit) {
    session.startTransaction();
  }

  try {
    const {
      type,
      amount,
      description,
      member,
      group,
      account: accountId,
      status = 'completed',
      relatedEntity,
      relatedEntityType,
      createdBy,
      paymentMethod = 'cash',
      receiptNumber,
    } = transactionData;

    // Validate required fields
    if (!type || !amount || !accountId) {
      throw new Error('Transaction type, amount, and account are required');
    }

    if (amount <= 0) {
      throw new Error('Transaction amount must be greater than zero');
    }

    // Get the account to update
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Determine if this is a credit or debit to the account
    const creditTypes = [
      'savings_contribution',
      'loan_repayment',
      'interest_earned',
      'refund',
      'transfer_in',
      'penalty_paid',
      'fee_paid',
      'adjustment_credit',
    ];

    const debitTypes = [
      'savings_withdrawal',
      'loan_disbursement',
      'interest_charged',
      'penalty_incurred',
      'fee_incurred',
      'transfer_out',
      'adjustment_debit',
    ];

    // Calculate new balance
    let newBalance = account.balance;
    if (!skipBalanceUpdate) {
      if (creditTypes.includes(type)) {
        newBalance += amount;
      } else if (debitTypes.includes(type)) {
        // Check if sufficient balance for debits (except for loan disbursements from loan fund)
        if (
          account.balance < amount &&
          !(type === 'loan_disbursement' && account.type === 'loan_fund')
        ) {
          throw new Error(
            `Insufficient account balance. Required: ${amount}, Available: ${account.balance}`
          );
        }
        newBalance -= amount;
      } else {
        throw new Error(`Unsupported transaction type: ${type}`);
      }

      // Ensure balance doesn't go negative for savings accounts
      if (account.type === 'savings' && newBalance < 0) {
        throw new Error('Savings account balance cannot be negative');
      }

      // Update account balance
      account.balance = newBalance;
      await account.save({ session });
    }

    // Create the transaction record
    const transaction = await Transaction.create(
      [
        {
          type,
          amount,
          description,
          member,
          group,
          relatedEntity,
          relatedEntityType,
          balanceAfter: newBalance,
          status,
          createdBy,
          paymentMethod,
          receiptNumber,
        },
      ],
      { session }
    );

    // Commit the transaction if we started it
    if (shouldCommit) {
      await session.commitTransaction();
      session.endSession();
    }

    return { transaction: transaction[0], account };
  } catch (error) {
    // Rollback on error if we started the session
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
}

/**
 * Process loan disbursement with proper account updates
 * @param {Object} loan - Loan document
 * @param {string} disbursedBy - User ID who disbursed the loan
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of disbursement
 */
async function processLoanDisbursement(loan, disbursedBy, options = {}) {
  const { session: existingSession } = options;

  const Account = mongoose.models.Account || require('../models/Account');
  const Transaction =
    mongoose.models.Transaction || require('../models/Transaction');

  const session = existingSession || (await mongoose.startSession());
  const shouldCommit = !existingSession;

  if (shouldCommit) {
    session.startTransaction();
  }

  try {
    // Find or create borrower's account
    let borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      // Create account for borrower if it doesn't exist
      borrowerAccount = await Account.create(
        [
          {
            owner: loan.borrower,
            ownerModel: loan.borrowerModel,
            type: 'savings',
            accountNumber: `SAV-${loan.borrower.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
            balance: 0,
            status: 'active',
          },
        ],
        { session }
      );
      borrowerAccount = borrowerAccount[0];
    }

    // Update borrower's account balance
    const newBalance = borrowerAccount.balance + loan.amountApproved;
    borrowerAccount.balance = newBalance;
    await borrowerAccount.save({ session });

    // Create transaction record for disbursement
    const transaction = await Transaction.create(
      [
        {
          type: 'loan_disbursement',
          member: loan.borrowerModel === 'User' ? loan.borrower : null,
          group: loan.borrowerModel === 'Group' ? loan.borrower : null,
          amount: loan.amountApproved,
          description: `Loan disbursement for Loan ID: ${loan._id}`,
          status: 'completed',
          balanceAfter: newBalance,
          createdBy: disbursedBy,
          relatedEntity: loan._id,
          relatedEntityType: 'Loan',
          paymentMethod: 'system_generated',
        },
      ],
      { session }
    );

    if (shouldCommit) {
      await session.commitTransaction();
      session.endSession();
    }

    return {
      transaction: transaction[0],
      account: borrowerAccount,
      success: true,
    };
  } catch (error) {
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
}

/**
 * Process loan repayment with proper account updates
 * @param {Object} repaymentData - Repayment data
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of repayment
 */
async function processLoanRepayment(repaymentData, options = {}) {
  const { session: existingSession } = options;

  const Account = mongoose.models.Account || require('../models/Account');
  const Transaction =
    mongoose.models.Transaction || require('../models/Transaction');
  const Loan = mongoose.models.Loan || require('../models/Loan');

  const session = existingSession || (await mongoose.startSession());
  const shouldCommit = !existingSession;

  if (shouldCommit) {
    session.startTransaction();
  }

  try {
    const {
      loanId,
      amount,
      memberId,
      groupId,
      paymentMethod = 'cash',
      description,
      createdBy,
    } = repaymentData;

    // Find the loan
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      throw new Error('Loan not found');
    }

    // Find borrower's account
    const borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      throw new Error('Borrower account not found');
    }

    // Update borrower's account balance (debit for repayment)
    const newBalance = borrowerAccount.balance - amount;
    if (newBalance < 0) {
      throw new Error('Insufficient balance for repayment');
    }

    borrowerAccount.balance = newBalance;
    await borrowerAccount.save({ session });

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          type: 'loan_repayment',
          member: memberId,
          group: groupId,
          amount: amount,
          description: description || `Loan repayment for Loan ID: ${loanId}`,
          status: 'completed',
          balanceAfter: newBalance,
          createdBy: createdBy,
          relatedEntity: loanId,
          relatedEntityType: 'Loan',
          paymentMethod: paymentMethod,
        },
      ],
      { session }
    );

    if (shouldCommit) {
      await session.commitTransaction();
      session.endSession();
    }

    return {
      transaction: transaction[0],
      account: borrowerAccount,
      success: true,
    };
  } catch (error) {
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
}

/**
 * Format a currency amount according to the system settings
 * @param {Number} amount - The amount to format
 * @returns {Promise<String>} - Formatted currency string
 */
async function formatCurrency(amount) {
  const currency = await getCurrencyFromSettings();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate loan repayment schedule based on loan parameters
 * @param {Object} loanData - Loan parameters (amount, interest rate, term)
 * @returns {Array} - Repayment schedule
 */
function calculateLoanSchedule(loanData) {
  const { amount, interestRate, loanTerm } = loanData;

  // Basic flat interest calculation
  const totalInterest = amount * (interestRate / 100);
  const totalAmount = amount + totalInterest;
  const monthlyPayment = totalAmount / loanTerm;

  const schedule = [];
  let currentDate = new Date();

  for (let i = 0; i < loanTerm; i++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    schedule.push({
      dueDate: new Date(currentDate),
      amount: parseFloat(monthlyPayment.toFixed(2)),
      status: 'pending',
    });
  }

  return schedule;
}

/**
 * Calculate interest earned on savings
 * @param {Number} principal - Principal amount
 * @param {Number} interestRate - Annual interest rate
 * @param {Number} days - Number of days
 * @returns {Number} - Interest amount
 */
function calculateSavingsInterest(principal, interestRate, days) {
  return (principal * interestRate * days) / (100 * 365);
}

/**
 * Validate financial transaction data
 * @param {Object} transactionData - Transaction data to validate
 * @returns {Object} - Validation result
 */
function validateTransactionData(transactionData) {
  const errors = [];

  if (!transactionData.type) {
    errors.push('Transaction type is required');
  }

  if (!transactionData.amount || transactionData.amount <= 0) {
    errors.push('Valid transaction amount is required');
  }

  if (!transactionData.account) {
    errors.push('Account is required');
  }

  if (!transactionData.createdBy) {
    errors.push('Transaction creator is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  createFinancialTransaction,
  processLoanDisbursement,
  processLoanRepayment,
  formatCurrency,
  calculateLoanSchedule,
  calculateSavingsInterest,
  validateTransactionData,
};
