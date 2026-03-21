import { Account } from '../../types/index';

export interface AccountSeederOptions {
  userId: string;
}

export function generateAccounts(options: AccountSeederOptions): Account[] {
  const { userId } = options;
  const accounts: Account[] = [];
  let accountId = 1;

  // Bank Accounts
  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'HDFC Bank - Savings',
    type: 'bank',
    balance: Math.floor(Math.random() * 300000) + 100000,
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  });

  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'ICICI Bank - Savings',
    type: 'bank',
    balance: Math.floor(Math.random() * 200000) + 50000,
    isActive: true,
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
  });

  // Credit Cards
  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'HDFC Credit Card',
    type: 'credit_card',
    balance: 0, // Credit cards typically show 0 balance here
    isActive: true,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  });

  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'Axis Bank Credit Card',
    type: 'credit_card',
    balance: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
  });

  // Cash
  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'Cash Wallet',
    type: 'cash',
    balance: Math.floor(Math.random() * 50000) + 10000,
    isActive: true,
    createdAt: new Date(),
  });

  // Digital Wallet
  accounts.push({
    id: `acc_${userId}_${accountId++}`,
    userId,
    name: 'Google Pay / Paytm',
    type: 'wallet',
    balance: Math.floor(Math.random() * 25000) + 5000,
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  });

  return accounts;
}
