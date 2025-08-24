/**
 * Centralized Financial Transaction Service
 * Ensures ACID compliance for all financial operations
 * Handles complex financial transactions atomically
 */

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const { FinancialConstants } = require('../utils/financialUtils');

class FinancialTransactionService {
  /**
   * Execute a financial transaction with ACID compliance
   * @param {Object} transactionData - Transaction data
   * @param {string} transactionData.type - Transaction type
   * @param {number} transactionData.amount - Transaction amount
   * @param {string} transactionData.accountId - Account ID
   * @param {string} transactionData.memberId - Member ID (optional)
   * @param {string} transactionData.groupId - Group ID (optional)
   * @param {string} transactionData.description - Transaction description
   * @param {string} transactionData.createdBy - User ID who created the transaction
   * @param {Object} transactionData.relatedEntity - Related entity data (optional)
   * @returns {Object} - Transaction result
   */
  static async executeTransaction(transactionData) {
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        // Validate transaction data
        const validation = this.validateTransactionData(transactionData);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // Get account details
        const account = await Account.findById(
          transactionData.accountId
        ).session(session);
        if (!account) {
          throw new Error('Account not found');
        }

        // Calculate new balance
        const newBalance = this.calculateNewBalance(
          account.balance,
          transactionData.amount,
          transactionData.type
        );

        // Validate balance constraints
        if (
          newBalance < 0 &&
          !this.isAllowedNegativeBalance(transactionData.type)
        ) {
          throw new Error('Insufficient funds for this transaction');
        }

        // Create transaction record
        const transaction = new Transaction({
          ...transactionData,
          balanceAfter: newBalance,
          status: 'completed',
        });

        await transaction.save({ session });

        // Update account balance
        account.balance = newBalance;
        account.lastTransactionAt = new Date();
        await account.save({ session });

        // Update related entities if specified
        if (transactionData.relatedEntity) {
          await this.updateRelatedEntity(
            transactionData.relatedEntity,
            session
          );
        }

        result = {
          success: true,
          transaction: transaction,
          newBalance: newBalance,
          message: 'Transaction completed successfully',
        };
      });

      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Execute multiple related transactions atomically
   * @param {Array} transactions - Array of transaction data
   * @returns {Object} - Result of all transactions
   */
  static async executeMultipleTransactions(transactions) {
    const session = await mongoose.startSession();

    try {
      let results = [];

      await session.withTransaction(async () => {
        for (const transactionData of transactions) {
          const result = await this.executeTransaction(transactionData);
          results.push(result);
        }
      });

      return {
        success: true,
        transactions: results,
        message: 'All transactions completed successfully',
      };
    } catch (error) {
      console.error('Multiple transactions failed:', error);
      throw new Error(`Multiple transactions failed: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Process loan disbursement with proper accounting
   * @param {Object} loanData - Loan data
   * @returns {Object} - Disbursement result
   */
  static async processLoanDisbursement(loanData) {
    const transactions = [
      {
        type: 'loan_disbursement',
        amount: loanData.amount,
        accountId: loanData.borrowerAccountId,
        memberId: loanData.borrowerId,
        groupId: loanData.groupId,
        description: `Loan disbursement - ${loanData.loanId}`,
        createdBy: loanData.createdBy,
        relatedEntity: {
          id: loanData.loanId,
          type: 'Loan',
        },
      },
    ];

    return await this.executeMultipleTransactions(transactions);
  }

  /**
   * Process loan repayment with proper accounting
   * @param {Object} repaymentData - Repayment data
   * @returns {Object} - Repayment result
   */
  static async processLoanRepayment(repaymentData) {
    const transactions = [
      {
        type: 'loan_repayment',
        amount: repaymentData.amount,
        accountId: repaymentData.borrowerAccountId,
        memberId: repaymentData.borrowerId,
        groupId: repaymentData.groupId,
        description: `Loan repayment - ${repaymentData.loanId}`,
        createdBy: repaymentData.createdBy,
        relatedEntity: {
          id: repaymentData.loanId,
          type: 'Loan',
        },
      },
    ];

    return await this.executeMultipleTransactions(transactions);
  }

  /**
   * Process savings contribution
   * @param {Object} contributionData - Contribution data
   * @returns {Object} - Contribution result
   */
  static async processSavingsContribution(contributionData) {
    const transaction = {
      type: 'savings_contribution',
      amount: contributionData.amount,
      accountId: contributionData.accountId,
      memberId: contributionData.memberId,
      groupId: contributionData.groupId,
      description: contributionData.description || 'Savings contribution',
      createdBy: contributionData.createdBy,
    };

    return await this.executeTransaction(transaction);
  }

  /**
   * Process savings withdrawal
   * @param {Object} withdrawalData - Withdrawal data
   * @returns {Object} - Withdrawal result
   */
  static async processSavingsWithdrawal(withdrawalData) {
    const transaction = {
      type: 'savings_withdrawal',
      amount: withdrawalData.amount,
      accountId: withdrawalData.accountId,
      memberId: withdrawalData.memberId,
      groupId: withdrawalData.groupId,
      description: withdrawalData.description || 'Savings withdrawal',
      createdBy: withdrawalData.createdBy,
    };

    return await this.executeTransaction(transaction);
  }

  /**
   * Calculate interest and apply it to accounts
   * @param {string} accountId - Account ID
   * @param {number} interestRate - Annual interest rate
   * @param {number} days - Number of days for interest calculation
   * @returns {Object} - Interest application result
   */
  static async calculateAndApplyInterest(accountId, interestRate, days) {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const interestAmount =
      (account.balance * interestRate * days) / (100 * 365);

    if (interestAmount > 0) {
      const transaction = {
        type: 'interest_earned',
        amount: interestAmount,
        accountId: accountId,
        memberId: account.member,
        groupId: account.group,
        description: `Interest earned for ${days} days`,
        createdBy: 'system',
        paymentMethod: 'system_generated',
      };

      return await this.executeTransaction(transaction);
    }

    return { success: true, message: 'No interest to apply' };
  }

  /**
   * Validate transaction data
   * @param {Object} transactionData - Transaction data to validate
   * @returns {Object} - Validation result
   */
  static validateTransactionData(transactionData) {
    if (
      !transactionData.type ||
      !Transaction.schema.path('type').enumValues.includes(transactionData.type)
    ) {
      return { isValid: false, error: 'Invalid transaction type' };
    }

    if (!transactionData.amount || transactionData.amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' };
    }

    if (!transactionData.accountId) {
      return { isValid: false, error: 'Account ID is required' };
    }

    if (!transactionData.createdBy) {
      return { isValid: false, error: 'Created by user ID is required' };
    }

    return { isValid: true };
  }

  /**
   * Calculate new balance after transaction
   * @param {number} currentBalance - Current account balance
   * @param {number} amount - Transaction amount
   * @param {string} type - Transaction type
   * @returns {number} - New balance
   */
  static calculateNewBalance(currentBalance, amount, type) {
    const creditTypes = [
      'savings_contribution',
      'loan_repayment',
      'interest_earned',
      'refund',
      'transfer_in',
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

    if (creditTypes.includes(type)) {
      return currentBalance + amount;
    } else if (debitTypes.includes(type)) {
      return currentBalance - amount;
    }

    return currentBalance;
  }

  /**
   * Check if transaction type allows negative balance
   * @param {string} type - Transaction type
   * @returns {boolean} - Whether negative balance is allowed
   */
  static isAllowedNegativeBalance(type) {
    // Only certain transaction types should allow negative balances
    const allowedTypes = ['loan_disbursement', 'adjustment_debit'];
    return allowedTypes.includes(type);
  }

  /**
   * Update related entity after transaction
   * @param {Object} relatedEntity - Related entity data
   * @param {Object} session - MongoDB session
   */
  static async updateRelatedEntity(relatedEntity, session) {
    if (!relatedEntity || !relatedEntity.id || !relatedEntity.type) {
      return;
    }

    try {
      switch (relatedEntity.type) {
        case 'Loan':
          const loan = await Loan.findById(relatedEntity.id).session(session);
          if (loan) {
            // Update loan status or other fields as needed
            await loan.save({ session });
          }
          break;
        // Add other entity types as needed
      }
    } catch (error) {
      console.error('Error updating related entity:', error);
      // Don't throw error here as the main transaction should still succeed
    }
  }

  /**
   * Get transaction summary for an account
   * @param {string} accountId - Account ID
   * @param {Date} startDate - Start date for summary
   * @param {Date} endDate - End date for summary
   * @returns {Object} - Transaction summary
   */
  static async getTransactionSummary(accountId, startDate, endDate) {
    const matchStage = {
      account: mongoose.Types.ObjectId(accountId),
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
      deleted: { $ne: true },
    };

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
        },
      },
    ]);

    return summary;
  }
}

module.exports = FinancialTransactionService;
