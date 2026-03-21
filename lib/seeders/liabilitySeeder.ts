import { Liability } from '../../types/index';

export interface LiabilitySeederOptions {
  userId: string;
}

export function generateLiabilities(options: LiabilitySeederOptions): Liability[] {
  const { userId } = options;
  const liabilities: Liability[] = [];
  let liabilityId = 1;

  // Home Loan (Primary liability)
  const homeLoanTotal = Math.floor(Math.random() * 2000000) + 3000000; // ₹30-50 lakhs
  const homeLoanOutstanding = Math.floor(homeLoanTotal * (Math.random() * 0.4 + 0.3)); // 30-70% remaining
  liabilities.push({
    id: `liab_${userId}_${liabilityId++}`,
    userId,
    name: 'Home Loan',
    type: 'personal_loan',
    totalAmount: homeLoanTotal,
    outstandingAmount: homeLoanOutstanding,
    notes: `Original Loan: ₹${homeLoanTotal}, Outstanding: ₹${homeLoanOutstanding}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  });

  // Car Loan (Secondary liability)
  const carLoanTotal = Math.floor(Math.random() * 700000) + 800000; // ₹8-15 lakhs
  const carLoanOutstanding = Math.floor(carLoanTotal * (Math.random() * 0.5 + 0.2)); // 20-70% remaining
  liabilities.push({
    id: `liab_${userId}_${liabilityId++}`,
    userId,
    name: 'Car Loan',
    type: 'personal_loan',
    totalAmount: carLoanTotal,
    outstandingAmount: carLoanOutstanding,
    notes: `Original Loan: ₹${carLoanTotal}, Outstanding: ₹${carLoanOutstanding}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  });

  // Personal Loan
  const personalLoanTotal = Math.floor(Math.random() * 500000) + 500000; // ₹5-10 lakhs
  const personalLoanOutstanding = Math.floor(
    personalLoanTotal * (Math.random() * 0.4 + 0.2)
  ); // 20-60% remaining
  liabilities.push({
    id: `liab_${userId}_${liabilityId++}`,
    userId,
    name: 'Personal Loan',
    type: 'personal_loan',
    totalAmount: personalLoanTotal,
    outstandingAmount: personalLoanOutstanding,
    notes: `Original Loan: ₹${personalLoanTotal}, Outstanding: ₹${personalLoanOutstanding}`,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  });

  // Credit Card Outstanding (Usually much smaller)
  const creditCardDue = Math.floor(Math.random() * 75000) + 25000; // ₹25k-1 lakh
  liabilities.push({
    id: `liab_${userId}_${liabilityId++}`,
    userId,
    name: 'Credit Card Outstanding',
    type: 'credit_card',
    totalAmount: creditCardDue,
    outstandingAmount: creditCardDue,
    notes: `Current month outstanding: ₹${creditCardDue}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return liabilities;
}
