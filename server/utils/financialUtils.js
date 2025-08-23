// server\utils\financialUtils.js
const mongoose = require('mongoose');
const { getCurrencyFromSettings } = require('./currencyUtils');

/**
 * Utility function to create a financial transaction with proper validation and account updates
 * This centralizes transaction creation logic to ensure consistency across different modules
 * Implements ACID properties:
 * - Atomicity: All operations succeed or fail together within a transaction
 * - Consistency: Account balances and transaction records remain valid
 * - Isolation: Concurrent transactions don't interfere with each other
 * - Durability: Once committed, changes persist even in case of system failure
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

    // Enhanced validation with more specific error messages
    if (!type) {
      throw new Error('VALIDATION_ERROR: Transaction type is required');
    }
    
    if (!amount) {
      throw new Error('VALIDATION_ERROR: Transaction amount is required');
    }
    
    if (!accountId) {
      throw new Error('VALIDATION_ERROR: Account ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      throw new Error('VALIDATION_ERROR: Invalid account ID format');
    }

    if (amount <= 0) {
      throw new Error('VALIDATION_ERROR: Transaction amount must be greater than zero');
    }
    
    // Validate transaction type is supported
    const validTypes = [
      'savings_contribution',
      'savings_withdrawal',
      'loan_disbursement',
      'loan_repayment',
      'interest_earned',
      'interest_charged',
      'penalty_incurred',
      'penalty_paid',
      'fee_incurred',
      'fee_paid',
      'transfer_in',
      'transfer_out',
      'refund',
      'adjustment_credit',
      'adjustment_debit'
    ];
    
    if (!validTypes.includes(type)) {
      throw new Error(`VALIDATION_ERROR: Unsupported transaction type: ${type}`);
    }

    // Get the account to update with proper locking for ACID compliance
    const account = await Account.findById(accountId).session(session);
    if (!account) {
      throw new Error('DATA_ERROR: Account not found');
    }

    if (account.status !== 'active') {
      throw new Error('VALIDATION_ERROR: Account is not active and cannot be used for transactions');
    }
    
    // Additional account validation
    if (account.frozen) {
      throw new Error('VALIDATION_ERROR: Account is frozen and cannot process transactions');
    }
    
    // Log transaction attempt for audit purposes
    console.log(`Transaction attempt: ${type} for account ${accountId}, amount: ${amount}`);


    // Determine if this is a credit or debit to the account
    // Classification is from the perspective of the linked Account (payer/payee).
    // For member/group savings accounts:
    // - Contributions and loan disbursements increase balance (credit)
    // - Repayments and withdrawals decrease balance (debit)
    const creditTypes = [
      'savings_contribution',
      'loan_disbursement',
      'interest_earned',
      'refund',
      'transfer_in',
      'adjustment_credit',
    ];

    const debitTypes = [
      'savings_withdrawal',
      'loan_repayment',
      'interest_charged',
      'penalty_incurred',
      'fee_incurred',
      'transfer_out',
      'adjustment_debit',
    ];

    // Calculate new balance with enhanced validation
    let newBalance = account.balance;
    if (!skipBalanceUpdate) {
      if (creditTypes.includes(type)) {
        // For credits, check for maximum balance limits if applicable
        const maxBalance = account.maxBalance || Number.MAX_SAFE_INTEGER;
        if (account.balance + amount > maxBalance) {
          throw new Error(
            `VALIDATION_ERROR: Transaction would exceed maximum account balance limit of ${maxBalance}`
          );
        }
        newBalance += amount;
      } else if (debitTypes.includes(type)) {
        // Enhanced check for sufficient balance with detailed error message
        if (
          account.balance < amount &&
          !(type === 'loan_disbursement' && account.type === 'loan_fund')
        ) {
          // Format the error message with currency if possible
          const formattedAmount = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' // Ideally this would come from settings
          }).format(amount);
          
          const formattedBalance = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' // Ideally this would come from settings
          }).format(account.balance);
          
          throw new Error(
            `INSUFFICIENT_FUNDS: Cannot complete ${type}. Required: ${formattedAmount}, Available: ${formattedBalance}`
          );
        }
        newBalance -= amount;
      } else {
        // This validation is now redundant due to earlier check, but kept for safety
        throw new Error(`VALIDATION_ERROR: Unsupported transaction type: ${type}`);
      }

      // Ensure balance doesn't go negative for savings accounts
      if (account.type === 'savings' && newBalance < 0) {
        throw new Error('VALIDATION_ERROR: Savings account balance cannot be negative');
      }

      // Update account balance with timestamp for audit
      account.balance = newBalance;
      account.lastUpdated = new Date();
      await account.save({ session });
      
      // Log successful balance update
      console.log(`Balance updated for account ${accountId}: ${account.balance} -> ${newBalance}`);
    }

    // Create the transaction record with enhanced data
    const transactionData = {
      type,
      amount,
      description: description || `${type} transaction`,
      member,
      group,
      account: accountId, // Explicitly store the account ID
      relatedEntity,
      relatedEntityType,
      balanceAfter: newBalance,
      balanceBefore: account.balance, // Store previous balance for audit
      status,
      createdBy,
      paymentMethod,
      receiptNumber,
      transactionDate: new Date(),
      metadata: { // Additional metadata for audit and tracking
        ipAddress: options.ipAddress || 'system',
        userAgent: options.userAgent || 'system',
        location: options.location || 'unknown'
      }
    };
    
    try {
      const transaction = await Transaction.create(
        [transactionData],
        { session }
      );
      
      // Log successful transaction creation
      console.log(`Transaction created: ${transaction[0]._id} for ${type}`);
      
      // Commit the transaction if we started it
      if (shouldCommit) {
        await session.commitTransaction();
        session.endSession();
        console.log(`Transaction committed successfully: ${transaction[0]._id}`);
      }
  
      return { 
        transaction: transaction[0], 
        account,
        success: true,
        message: 'Transaction completed successfully'
      };
    } catch (dbError) {
      // Handle specific database errors
      console.error(`Transaction creation failed: ${dbError.message}`);
      
      // Rollback on error if we started the session
      if (shouldCommit) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Transaction aborted due to error: ${dbError.message}`);
      }
      
      // Rethrow with more context
      throw new Error(`DATABASE_ERROR: Failed to create transaction record: ${dbError.message}`);
    }
  } catch (error) {
    // Rollback on error if we started the session
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Transaction aborted due to error: ${error.message}`);
    }
    
    // Add error categorization prefix if not already present
    if (!error.message.includes('_ERROR:')) {
      error.message = `TRANSACTION_ERROR: ${error.message}`;
    }
    
    throw error;
  }
}

/**
 * Process loan disbursement with proper account updates and ACID compliance
 * @param {Object} loan - Loan document
 * @param {string} disbursedBy - User ID who disbursed the loan
 * @param {Object} options - Additional options including session and metadata
 * @returns {Promise<Object>} - Result of disbursement with transaction details
 */
async function processLoanDisbursement(loan, disbursedBy, options = {}) {
  const { session: existingSession, ...metadata } = options;

  const Account = mongoose.models.Account || require('../models/Account');
  const Transaction =
    mongoose.models.Transaction || require('../models/Transaction');
  const Loan = mongoose.models.Loan || require('../models/Loan');

  // Start a session for transaction atomicity
  const session = existingSession || (await mongoose.startSession());
  const shouldCommit = !existingSession;

  if (shouldCommit) {
    session.startTransaction();
    console.log(`Starting loan disbursement transaction for loan: ${loan._id}`);
  }

  try {
    // Validate loan status if it's a loan document
    if (loan._id && typeof loan.status !== 'undefined') {
      if (loan.status !== 'approved') {
        throw new Error(`VALIDATION_ERROR: Cannot disburse loan with status '${loan.status}'. Loan must be approved.`);
      }
      
      if (!loan.amountApproved || loan.amountApproved <= 0) {
        throw new Error('VALIDATION_ERROR: Loan has no valid approved amount for disbursement');
      }
    }

    // Find or create borrower's account with enhanced validation
    let borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      console.log(`Creating new savings account for borrower: ${loan.borrower}`);
      // Create account for borrower if it doesn't exist
      try {
        borrowerAccount = await Account.create(
          [
            {
              owner: loan.borrower,
              ownerModel: loan.borrowerModel,
              type: 'savings',
              accountNumber: `SAV-${loan.borrower.toString().substring(0, 8)}-${Date.now().toString().slice(-4)}`,
              balance: 0,
              status: 'active',
              createdBy: disbursedBy,
              createdAt: new Date(),
              lastUpdated: new Date()
            },
          ],
          { session }
        );
        borrowerAccount = borrowerAccount[0];
        console.log(`Created new savings account: ${borrowerAccount._id}`);
      } catch (accountError) {
        throw new Error(`RESOURCE_ERROR: Failed to create savings account: ${accountError.message}`);
      }
    }

    // Update borrower's account balance with audit trail
    const balanceBefore = borrowerAccount.balance;
    const newBalance = balanceBefore + loan.amountApproved;
    
    // Check for maximum balance limits if applicable
    const maxBalance = borrowerAccount.maxBalance || Number.MAX_SAFE_INTEGER;
    if (newBalance > maxBalance) {
      throw new Error(
        `VALIDATION_ERROR: Disbursement would exceed maximum account balance limit of ${maxBalance}`
      );
    }
    
    borrowerAccount.balance = newBalance;
    borrowerAccount.lastUpdated = new Date();
    await borrowerAccount.save({ session });
    console.log(`Updated account ${borrowerAccount._id} balance: ${balanceBefore} -> ${newBalance}`);

    // Create transaction record for disbursement with enhanced data
    const transactionData = {
      type: 'loan_disbursement',
      member: loan.borrowerModel === 'User' ? loan.borrower : null,
      group: loan.borrowerModel === 'Group' ? loan.borrower : null,
      account: borrowerAccount._id,
      amount: loan.amountApproved,
      description: `Loan disbursement for Loan ID: ${loan._id}`,
      status: 'completed',
      balanceAfter: newBalance,
      balanceBefore: balanceBefore,
      createdBy: disbursedBy,
      relatedEntity: loan._id,
      relatedEntityType: 'Loan',
      paymentMethod: 'system_generated',
      transactionDate: new Date(),
      metadata: {
        ipAddress: metadata.ipAddress || 'system',
        userAgent: metadata.userAgent || 'system',
        location: metadata.location || 'unknown'
      }
    };
    
    const transaction = await Transaction.create([transactionData], { session });
    console.log(`Created loan disbursement transaction: ${transaction[0]._id}`);

    // Update loan status to disbursed if it's a loan document
    if (loan._id && typeof loan.status !== 'undefined') {
      loan.status = 'disbursed';
      loan.disbursementDate = new Date();
      loan.outstandingBalance = loan.amountApproved + (loan.interestAmount || 0);
      loan.lastUpdated = new Date();
      await loan.save({ session });
      console.log(`Updated loan ${loan._id} status to disbursed`);
    }

    // Commit the transaction if we started it
    if (shouldCommit) {
      await session.commitTransaction();
      session.endSession();
      console.log(`Loan disbursement transaction committed successfully`);
    }

    return {
      transaction: transaction[0],
      account: borrowerAccount,
      loan: loan,
      success: true,
      message: 'Loan disbursement processed successfully'
    };
  } catch (error) {
    // Rollback on error if we started the session
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Loan disbursement transaction aborted: ${error.message}`);
    }
    
    // Add error categorization prefix if not already present
    if (!error.message.includes('_ERROR:')) {
      error.message = `TRANSACTION_ERROR: ${error.message}`;
    }
    
    throw error;
  }
}

/**
 * Process loan repayment with proper account updates and ACID compliance
 * @param {Object} repaymentData - Repayment data including loanId, amount, memberId, groupId
 * @param {Object} options - Additional options including session, metadata
 * @returns {Promise<Object>} - Result of repayment with transaction details
 */
async function processLoanRepayment(repaymentData, options = {}) {
  const { session: existingSession, ...metadata } = options;

  const Account = mongoose.models.Account || require('../models/Account');
  const Transaction = mongoose.models.Transaction || require('../models/Transaction');
  const Loan = mongoose.models.Loan || require('../models/Loan');

  // Start a session for transaction atomicity
  const session = existingSession || (await mongoose.startSession());
  const shouldCommit = !existingSession;

  if (shouldCommit) {
    session.startTransaction();
    console.log(`Starting loan repayment transaction for loan: ${repaymentData.loanId}`);
  }

  try {
    // Validate required fields
    const {
      loanId,
      amount,
      memberId,
      groupId,
      paymentMethod = 'cash',
      description,
      createdBy,
      receiptNumber
    } = repaymentData;

    if (!loanId) throw new Error('VALIDATION_ERROR: Loan ID is required');
    if (!amount || amount <= 0) throw new Error('VALIDATION_ERROR: Valid repayment amount is required');
    if (!createdBy) throw new Error('VALIDATION_ERROR: Creator information is required for audit');

    // Find the loan with validation
    const loan = await Loan.findById(loanId).session(session);
    if (!loan) {
      throw new Error('RESOURCE_ERROR: Loan not found');
    }
    
    if (loan.status === 'closed') {
      throw new Error('VALIDATION_ERROR: Cannot make repayment on a closed loan');
    }

    // Find borrower's account with enhanced validation
    const borrowerAccount = await Account.findOne({
      owner: loan.borrower,
      ownerModel: loan.borrowerModel,
      type: 'savings',
      status: 'active',
    }).session(session);

    if (!borrowerAccount) {
      throw new Error('RESOURCE_ERROR: Borrower savings account not found or inactive');
    }

    // Calculate and validate new balance
    const balanceBefore = borrowerAccount.balance;
    const newBalance = balanceBefore - amount;
    
    if (newBalance < 0) {
      // Format currency for better error message
      const formattedAmount = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(amount);
      
      const formattedBalance = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(balanceBefore);
      
      throw new Error(`INSUFFICIENT_FUNDS: Cannot complete loan repayment. Required: ${formattedAmount}, Available: ${formattedBalance}`);
    }

    // Update borrower's account balance with audit timestamp
    borrowerAccount.balance = newBalance;
    borrowerAccount.lastUpdated = new Date();
    await borrowerAccount.save({ session });
    console.log(`Updated account ${borrowerAccount._id} balance: ${balanceBefore} -> ${newBalance}`);

    // Create transaction record with enhanced data
    const transactionData = {
      type: 'loan_repayment',
      member: memberId,
      group: groupId,
      account: borrowerAccount._id,
      amount: amount,
      description: description || `Loan repayment for Loan ID: ${loanId}`,
      status: 'completed',
      balanceAfter: newBalance,
      balanceBefore: balanceBefore,
      createdBy: createdBy,
      relatedEntity: loanId,
      relatedEntityType: 'Loan',
      paymentMethod: paymentMethod,
      receiptNumber: receiptNumber,
      transactionDate: new Date(),
      metadata: {
        ipAddress: metadata.ipAddress || 'system',
        userAgent: metadata.userAgent || 'system',
        location: metadata.location || 'unknown'
      }
    };
    
    const transaction = await Transaction.create([transactionData], { session });
    console.log(`Created loan repayment transaction: ${transaction[0]._id}`);

    // Update loan balance if needed
    if (loan.outstandingBalance) {
      const newOutstandingBalance = Math.max(0, loan.outstandingBalance - amount);
      loan.outstandingBalance = newOutstandingBalance;
      loan.lastPaymentDate = new Date();
      
      // Check if loan is fully paid
      if (newOutstandingBalance === 0) {
        loan.status = 'closed';
        loan.closedDate = new Date();
        console.log(`Loan ${loanId} fully repaid and closed`);
      }
      
      await loan.save({ session });
      console.log(`Updated loan ${loanId} outstanding balance: ${loan.outstandingBalance}`);
    }

    // Commit the transaction if we started it
    if (shouldCommit) {
      await session.commitTransaction();
      session.endSession();
      console.log(`Loan repayment transaction committed successfully`);
    }

    return {
      transaction: transaction[0],
      account: borrowerAccount,
      loan: loan,
      success: true,
      message: 'Loan repayment processed successfully'
    };
  } catch (error) {
    // Rollback on error if we started the session
    if (shouldCommit) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Loan repayment transaction aborted: ${error.message}`);
    }
    
    // Add error categorization prefix if not already present
    if (!error.message.includes('_ERROR:')) {
      error.message = `TRANSACTION_ERROR: ${error.message}`;
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
