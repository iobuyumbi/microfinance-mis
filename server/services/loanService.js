
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const DecimalUtils = require('../utils/decimalUtils');
const { executeFinancialOperation } = require('../utils/transactionWrapper');

class LoanService {
  /**
   * Create a new loan application
   */
  static async createLoan(loanData, userId, req) {
    return await executeFinancialOperation({
      operation: async (session) => {
        // Calculate loan details
        const amount = DecimalUtils.toDecimal(loanData.amount);
        const interestRate = DecimalUtils.toDecimal(loanData.interestRate);
        const termMonths = loanData.termMonths;

        // Calculate monthly payment using loan formula
        const monthlyRate = DecimalUtils.divide(interestRate, DecimalUtils.toDecimal(1200)); // Annual rate to monthly decimal
        const monthlyRateNum = DecimalUtils.toNumber(monthlyRate);
        const amountNum = DecimalUtils.toNumber(amount);
        
        let monthlyPayment;
        if (monthlyRateNum === 0) {
          monthlyPayment = DecimalUtils.divide(amount, DecimalUtils.toDecimal(termMonths));
        } else {
          const factor = Math.pow(1 + monthlyRateNum, termMonths);
          const payment = (amountNum * monthlyRateNum * factor) / (factor - 1);
          monthlyPayment = DecimalUtils.toDecimal(payment);
        }

        const totalAmount = DecimalUtils.multiply(monthlyPayment, DecimalUtils.toDecimal(termMonths));
        const totalInterest = DecimalUtils.subtract(totalAmount, amount);

        const loan = new Loan({
          ...loanData,
          amount,
          interestRate,
          monthlyPayment,
          totalInterest,
          totalAmount,
          outstandingBalance: totalAmount,
          amountPaid: DecimalUtils.toDecimal(0),
          status: 'pending'
        });

        return await loan.save({ session });
      },
      userId,
      resource: 'loan',
      req,
      metadata: {
        action: 'CREATE',
        amount: loanData.amount
      }
    });
  }

  /**
   * Approve and disburse loan
   */
  static async approveLoan(loanId, approvedBy, req) {
    return await executeFinancialOperation({
      operation: async (session) => {
        const loan = await Loan.findById(loanId).session(session);
        if (!loan) {
          throw new Error('Loan not found');
        }

        if (loan.status !== 'pending') {
          throw new Error('Loan is not in pending status');
        }

        // Update loan status
        loan.status = 'approved';
        loan.approvedBy = approvedBy;
        loan.approvedAt = new Date();
        await loan.save({ session });

        // Create disbursement transaction
        const disbursement = new Transaction({
          type: 'loan_disbursement',
          amount: loan.amount,
          description: `Loan disbursement for loan ${loan._id}`,
          relatedLoan: loan._id,
          relatedUser: loan.borrowerId,
          createdBy: approvedBy,
          status: 'completed'
        });

        await disbursement.save({ session });

        // Update borrower's account balance
        const account = await Account.findOne({ userId: loan.borrowerId }).session(session);
        if (account) {
          account.balance = DecimalUtils.add(account.balance, loan.amount);
          await account.save({ session });
        }

        return { loan, amount: loan.amount };
      },
      userId: approvedBy,
      resource: 'loan',
      resourceId: loanId,
      req,
      metadata: {
        action: 'LOAN_APPROVE',
        amount: 0 // Will be set from operation result
      }
    });
  }

  /**
   * Record loan repayment
   */
  static async recordRepayment(loanId, repaymentData, userId, req) {
    return await executeFinancialOperation({
      operation: async (session) => {
        const loan = await Loan.findById(loanId).session(session);
        if (!loan) {
          throw new Error('Loan not found');
        }

        if (loan.status !== 'approved' && loan.status !== 'partial') {
          throw new Error('Cannot record repayment for this loan status');
        }

        const repaymentAmount = DecimalUtils.toDecimal(repaymentData.amount);
        
        // Validate repayment amount
        if (DecimalUtils.compare(repaymentAmount, loan.outstandingBalance) > 0) {
          throw new Error('Repayment amount exceeds outstanding balance');
        }

        // Update loan balances
        loan.amountPaid = DecimalUtils.add(loan.amountPaid, repaymentAmount);
        loan.outstandingBalance = DecimalUtils.subtract(loan.outstandingBalance, repaymentAmount);

        // Update loan status
        if (DecimalUtils.compare(loan.outstandingBalance, DecimalUtils.toDecimal(0)) === 0) {
          loan.status = 'completed';
          loan.completedAt = new Date();
        } else {
          loan.status = 'partial';
        }

        await loan.save({ session });

        // Create repayment transaction
        const repayment = new Transaction({
          type: 'loan_repayment',
          amount: repaymentAmount,
          description: `Loan repayment for loan ${loan._id}`,
          relatedLoan: loan._id,
          relatedUser: loan.borrowerId,
          createdBy: userId,
          status: 'completed',
          paymentMethod: repaymentData.paymentMethod,
          reference: repaymentData.reference
        });

        await repayment.save({ session });

        return { loan, repayment };
      },
      userId,
      resource: 'loan',
      resourceId: loanId,
      req,
      metadata: {
        action: 'REPAYMENT_RECORD',
        amount: repaymentData.amount
      }
    });
  }

  /**
   * Calculate loan interest and penalties
   */
  static calculateInterestAndPenalties(loan, asOfDate = new Date()) {
    // Calculate days since disbursement
    const disbursementDate = loan.approvedAt || loan.createdAt;
    const daysDiff = Math.floor((asOfDate - disbursementDate) / (1000 * 60 * 60 * 24));
    const monthsElapsed = daysDiff / 30.44; // Average days per month

    // Calculate expected amount paid
    const expectedPayments = Math.floor(monthsElapsed);
    const expectedAmountPaid = expectedPayments * DecimalUtils.toNumber(loan.monthlyPayment);
    
    // Calculate if there's a penalty for late payment
    const actualPaid = DecimalUtils.toNumber(loan.amountPaid);
    const latePenalty = Math.max(0, expectedAmountPaid - actualPaid) * 0.02; // 2% penalty

    return {
      expectedAmountPaid: DecimalUtils.toDecimal(expectedAmountPaid),
      actualAmountPaid: loan.amountPaid,
      latePenalty: DecimalUtils.toDecimal(latePenalty),
      isDue: expectedAmountPaid > actualPaid,
      monthsElapsed: Math.floor(monthsElapsed)
    };
  }
}

module.exports = LoanService;
