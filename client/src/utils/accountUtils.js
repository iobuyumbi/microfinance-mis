/**
 * Account utility functions
 */

// Generate unique account number
export const generateAccountNumber = () => {
  const prefix = "ACC";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Generate loan number
export const generateLoanNumber = () => {
  const prefix = "LOAN";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Generate transaction number
export const generateTransactionNumber = () => {
  const prefix = "TXN";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Generate group number
export const generateGroupNumber = () => {
  const prefix = "GRP";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Generate meeting number
export const generateMeetingNumber = () => {
  const prefix = "MTG";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// Validate account number format
export const isValidAccountNumber = (accountNumber) => {
  if (!accountNumber || typeof accountNumber !== "string") return false;

  // Remove spaces and dashes
  const cleaned = accountNumber.replace(/[\s-]/g, "");

  // Check if it matches the pattern: ACC + 6 digits + 3 digits
  return /^ACC\d{9}$/.test(cleaned);
};

// Validate loan number format
export const isValidLoanNumber = (loanNumber) => {
  if (!loanNumber || typeof loanNumber !== "string") return false;

  const cleaned = loanNumber.replace(/[\s-]/g, "");
  return /^LOAN\d{9}$/.test(cleaned);
};

// Validate transaction number format
export const isValidTransactionNumber = (transactionNumber) => {
  if (!transactionNumber || typeof transactionNumber !== "string") return false;

  const cleaned = transactionNumber.replace(/[\s-]/g, "");
  return /^TXN\d{9}$/.test(cleaned);
};

// Format account number for display
export const formatAccountNumber = (accountNumber) => {
  if (!accountNumber) return "";

  const cleaned = accountNumber.replace(/[\s-]/g, "");

  if (cleaned.startsWith("ACC")) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 9)}-${cleaned.slice(9)}`;
  }

  return accountNumber;
};

// Format loan number for display
export const formatLoanNumber = (loanNumber) => {
  if (!loanNumber) return "";

  const cleaned = loanNumber.replace(/[\s-]/g, "");

  if (cleaned.startsWith("LOAN")) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10)}`;
  }

  return loanNumber;
};

// Calculate account balance
export const calculateAccountBalance = (transactions) => {
  if (!transactions || !Array.isArray(transactions)) return 0;

  return transactions.reduce((balance, transaction) => {
    if (transaction.type === "credit" || transaction.type === "deposit") {
      return balance + transaction.amount;
    } else if (
      transaction.type === "debit" ||
      transaction.type === "withdrawal"
    ) {
      return balance - transaction.amount;
    }
    return balance;
  }, 0);
};

// Calculate account interest earned
export const calculateInterestEarned = (transactions, interestRate) => {
  if (!transactions || !Array.isArray(transactions) || !interestRate) return 0;

  const interestTransactions = transactions.filter(
    (t) =>
      t.type === "interest" || t.description?.toLowerCase().includes("interest")
  );

  return interestTransactions.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);
};

// Get account type display name
export const getAccountTypeDisplayName = (accountType) => {
  const types = {
    savings: "Savings Account",
    checking: "Checking Account",
    loan: "Loan Account",
    investment: "Investment Account",
    group: "Group Account",
    emergency: "Emergency Fund",
    business: "Business Account",
  };

  return types[accountType] || accountType;
};

// Get account status display name
export const getAccountStatusDisplayName = (status) => {
  const statuses = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    closed: "Closed",
    pending: "Pending",
    frozen: "Frozen",
  };

  return statuses[status] || status;
};

// Check if account is active
export const isAccountActive = (account) => {
  if (!account) return false;

  return account.status === "active" || account.isActive === true;
};

// Check if account has sufficient balance
export const hasSufficientBalance = (account, requiredAmount) => {
  if (!account || !requiredAmount) return false;

  const balance =
    account.balance || calculateAccountBalance(account.transactions || []);
  return balance >= requiredAmount;
};

// Calculate account growth rate
export const calculateAccountGrowthRate = (
  currentBalance,
  initialBalance,
  timePeriod
) => {
  if (!currentBalance || !initialBalance || !timePeriod || initialBalance === 0)
    return 0;

  const growthRate = ((currentBalance - initialBalance) / initialBalance) * 100;
  return Math.round(growthRate * 100) / 100;
};

// Get account summary
export const getAccountSummary = (account) => {
  if (!account) return null;

  const balance =
    account.balance || calculateAccountBalance(account.transactions || []);
  const transactions = account.transactions || [];

  const summary = {
    accountNumber: account.accountNumber,
    accountType: getAccountTypeDisplayName(account.accountType),
    status: getAccountStatusDisplayName(account.status),
    balance: balance,
    transactionCount: transactions.length,
    lastTransaction:
      transactions.length > 0 ? transactions[transactions.length - 1] : null,
    isActive: isAccountActive(account),
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };

  return summary;
};

// Generate account statement
export const generateAccountStatement = (account, startDate, endDate) => {
  if (!account || !startDate || !endDate) return null;

  const transactions = account.transactions || [];
  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate >= new Date(startDate) &&
      transactionDate <= new Date(endDate)
    );
  });

  const openingBalance = calculateAccountBalance(
    transactions.filter((t) => new Date(t.date) < new Date(startDate))
  );

  const closingBalance = calculateAccountBalance(
    transactions.filter((t) => new Date(t.date) <= new Date(endDate))
  );

  const totalCredits = filteredTransactions
    .filter((t) => t.type === "credit" || t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = filteredTransactions
    .filter((t) => t.type === "debit" || t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    accountNumber: account.accountNumber,
    accountType: getAccountTypeDisplayName(account.accountType),
    startDate: startDate,
    endDate: endDate,
    openingBalance: openingBalance,
    closingBalance: closingBalance,
    totalCredits: totalCredits,
    totalDebits: totalDebits,
    transactions: filteredTransactions,
    transactionCount: filteredTransactions.length,
  };
};

// Calculate account fees
export const calculateAccountFees = (account, feeStructure) => {
  if (!account || !feeStructure) return 0;

  let totalFees = 0;

  // Monthly maintenance fee
  if (
    feeStructure.monthlyFee &&
    account.balance < feeStructure.minimumBalance
  ) {
    totalFees += feeStructure.monthlyFee;
  }

  // Transaction fees
  const transactions = account.transactions || [];
  const transactionCount = transactions.length;

  if (
    feeStructure.transactionFee &&
    transactionCount > feeStructure.freeTransactions
  ) {
    const extraTransactions = transactionCount - feeStructure.freeTransactions;
    totalFees += extraTransactions * feeStructure.transactionFee;
  }

  // Overdraft fees
  if (account.balance < 0 && feeStructure.overdraftFee) {
    totalFees += feeStructure.overdraftFee;
  }

  return totalFees;
};

// Get account alerts
export const getAccountAlerts = (account, thresholds) => {
  if (!account || !thresholds) return [];

  const alerts = [];
  const balance =
    account.balance || calculateAccountBalance(account.transactions || []);

  // Low balance alert
  if (balance < thresholds.lowBalance) {
    alerts.push({
      type: "warning",
      message: `Low balance alert: Your account balance is ${balance}`,
      severity: "medium",
    });
  }

  // High balance alert
  if (balance > thresholds.highBalance) {
    alerts.push({
      type: "info",
      message: `High balance alert: Consider investing excess funds`,
      severity: "low",
    });
  }

  // Inactive account alert
  const lastTransaction =
    account.transactions?.[account.transactions.length - 1];
  if (lastTransaction) {
    const daysSinceLastTransaction =
      (Date.now() - new Date(lastTransaction.date).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceLastTransaction > thresholds.inactiveDays) {
      alerts.push({
        type: "warning",
        message: `Account inactive for ${Math.floor(daysSinceLastTransaction)} days`,
        severity: "medium",
      });
    }
  }

  return alerts;
};
