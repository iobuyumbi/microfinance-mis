/**
 * Loan calculation utility functions
 */

// Calculate monthly loan payment (Amortization formula)
export const calculateLoanPayment = (principal, annualRate, months) => {
  if (!principal || !annualRate || !months || months <= 0) return 0;

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(payment * 100) / 100; // Round to 2 decimal places
};

// Calculate total interest over loan term
export const calculateTotalInterest = (principal, monthlyPayment, months) => {
  if (!principal || !monthlyPayment || !months) return 0;

  const totalPayments = monthlyPayment * months;
  return Math.round((totalPayments - principal) * 100) / 100;
};

// Calculate remaining balance after n payments
export const calculateRemainingBalance = (
  principal,
  monthlyPayment,
  monthsPaid,
  annualRate
) => {
  if (!principal || !monthlyPayment || !monthsPaid || !annualRate) return 0;

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return Math.max(0, principal - monthlyPayment * monthsPaid);
  }

  const remainingBalance =
    principal * Math.pow(1 + monthlyRate, monthsPaid) -
    (monthlyPayment * (Math.pow(1 + monthlyRate, monthsPaid) - 1)) /
      monthlyRate;

  return Math.max(0, Math.round(remainingBalance * 100) / 100);
};

// Calculate loan-to-value ratio
export const calculateLTV = (loanAmount, propertyValue) => {
  if (!loanAmount || !propertyValue || propertyValue === 0) return 0;

  return Math.round((loanAmount / propertyValue) * 100 * 100) / 100;
};

// Calculate debt-to-income ratio
export const calculateDTI = (monthlyDebtPayments, monthlyIncome) => {
  if (!monthlyDebtPayments || !monthlyIncome || monthlyIncome === 0) return 0;

  return Math.round((monthlyDebtPayments / monthlyIncome) * 100 * 100) / 100;
};

// Calculate interest paid in a specific month
export const calculateMonthlyInterest = (remainingBalance, annualRate) => {
  if (!remainingBalance || !annualRate) return 0;

  const monthlyRate = annualRate / 12 / 100;
  return Math.round(remainingBalance * monthlyRate * 100) / 100;
};

// Calculate principal paid in a specific month
export const calculateMonthlyPrincipal = (monthlyPayment, monthlyInterest) => {
  if (!monthlyPayment || !monthlyInterest) return 0;

  return Math.round((monthlyPayment - monthlyInterest) * 100) / 100;
};

// Generate amortization schedule
export const generateAmortizationSchedule = (principal, annualRate, months) => {
  if (!principal || !annualRate || !months || months <= 0) return [];

  const schedule = [];
  let remainingBalance = principal;
  const monthlyPayment = calculateLoanPayment(principal, annualRate, months);

  for (let month = 1; month <= months; month++) {
    const monthlyInterest = calculateMonthlyInterest(
      remainingBalance,
      annualRate
    );
    const monthlyPrincipal = calculateMonthlyPrincipal(
      monthlyPayment,
      monthlyInterest
    );

    remainingBalance = Math.max(0, remainingBalance - monthlyPrincipal);

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: monthlyPrincipal,
      interest: monthlyInterest,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      totalPaid: Math.round(monthlyPayment * month * 100) / 100,
      totalInterest:
        Math.round(
          (monthlyPayment * month - principal + remainingBalance) * 100
        ) / 100,
    });
  }

  return schedule;
};

// Calculate early repayment penalty
export const calculateEarlyRepaymentPenalty = (
  remainingBalance,
  penaltyRate
) => {
  if (!remainingBalance || !penaltyRate) return 0;

  return Math.round(remainingBalance * (penaltyRate / 100) * 100) / 100;
};

// Calculate loan affordability
export const calculateLoanAffordability = (
  monthlyIncome,
  monthlyExpenses,
  downPayment,
  propertyValue,
  annualRate,
  months
) => {
  if (
    !monthlyIncome ||
    !monthlyExpenses ||
    !propertyValue ||
    !annualRate ||
    !months
  )
    return null;

  const availableIncome = monthlyIncome - monthlyExpenses;
  const maxLoanAmount = propertyValue - downPayment;

  // Calculate maximum monthly payment based on available income (using 28% rule)
  const maxMonthlyPayment = availableIncome * 0.28;

  // Calculate maximum loan amount based on monthly payment
  const monthlyRate = annualRate / 12 / 100;
  const maxLoanFromIncome =
    monthlyRate === 0
      ? maxMonthlyPayment * months
      : (maxMonthlyPayment * (Math.pow(1 + monthlyRate, months) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, months));

  const affordableLoanAmount = Math.min(maxLoanAmount, maxLoanFromIncome);

  return {
    affordableLoanAmount: Math.round(affordableLoanAmount * 100) / 100,
    maxMonthlyPayment: Math.round(maxMonthlyPayment * 100) / 100,
    availableIncome: Math.round(availableIncome * 100) / 100,
    isAffordable: affordableLoanAmount >= maxLoanAmount,
  };
};

// Calculate refinancing savings
export const calculateRefinancingSavings = (
  currentLoan,
  newRate,
  newTerm,
  refinancingCosts
) => {
  if (!currentLoan || !newRate || !newTerm) return null;

  const currentMonthlyPayment = currentLoan.monthlyPayment;
  const currentRemainingPayments = currentLoan.remainingPayments;
  const currentRemainingBalance = currentLoan.remainingBalance;

  const newMonthlyPayment = calculateLoanPayment(
    currentRemainingBalance,
    newRate,
    newTerm
  );
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;

  const totalCurrentPayments = currentMonthlyPayment * currentRemainingPayments;
  const totalNewPayments = newMonthlyPayment * newTerm;
  const totalSavings =
    totalCurrentPayments - totalNewPayments - (refinancingCosts || 0);

  return {
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    breakEvenMonths: refinancingCosts
      ? Math.ceil(refinancingCosts / monthlySavings)
      : 0,
    isWorthwhile: totalSavings > 0,
  };
};

// Calculate loan comparison
export const compareLoans = (loans) => {
  if (!loans || !Array.isArray(loans) || loans.length === 0) return [];

  return loans
    .map((loan) => {
      const monthlyPayment = calculateLoanPayment(
        loan.principal,
        loan.annualRate,
        loan.months
      );
      const totalInterest = calculateTotalInterest(
        loan.principal,
        monthlyPayment,
        loan.months
      );
      const totalPayments = monthlyPayment * loan.months;

      return {
        ...loan,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalPayments: Math.round(totalPayments * 100) / 100,
        effectiveRate:
          Math.round((totalInterest / loan.principal) * 100 * 100) / 100,
      };
    })
    .sort((a, b) => a.totalPayments - b.totalPayments);
};

// Calculate loan eligibility score
export const calculateLoanEligibilityScore = (applicant) => {
  if (!applicant) return 0;

  let score = 0;

  // Credit score (0-850 scale)
  if (applicant.creditScore >= 750) score += 30;
  else if (applicant.creditScore >= 700) score += 25;
  else if (applicant.creditScore >= 650) score += 20;
  else if (applicant.creditScore >= 600) score += 15;
  else if (applicant.creditScore >= 550) score += 10;

  // Income stability
  if (applicant.employmentYears >= 5) score += 20;
  else if (applicant.employmentYears >= 3) score += 15;
  else if (applicant.employmentYears >= 1) score += 10;

  // Debt-to-income ratio
  if (applicant.dtiRatio <= 0.28) score += 25;
  else if (applicant.dtiRatio <= 0.36) score += 20;
  else if (applicant.dtiRatio <= 0.43) score += 15;
  else if (applicant.dtiRatio <= 0.5) score += 10;

  // Down payment
  if (applicant.downPaymentPercent >= 20) score += 15;
  else if (applicant.downPaymentPercent >= 10) score += 10;
  else if (applicant.downPaymentPercent >= 5) score += 5;

  // Loan-to-value ratio
  if (applicant.ltvRatio <= 0.8) score += 10;
  else if (applicant.ltvRatio <= 0.9) score += 5;

  return Math.min(100, score);
};

// Get loan eligibility status
export const getLoanEligibilityStatus = (score) => {
  if (score >= 80)
    return { status: "Excellent", color: "green", approved: true };
  if (score >= 70) return { status: "Good", color: "blue", approved: true };
  if (score >= 60) return { status: "Fair", color: "yellow", approved: true };
  if (score >= 50) return { status: "Poor", color: "orange", approved: false };
  return { status: "Very Poor", color: "red", approved: false };
};
