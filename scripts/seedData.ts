/**
 * Main seed data generator for Finsight
 * Creates realistic test users with complete financial data
 */

import {
  generateTransactions,
  generateAssets,
  generateLiabilities,
  generateGoals,
  generateAccounts,
} from '../lib/seeders/index';
import { User, Category } from '../types/index';

export interface SeedDataOptions {
  clearExisting?: boolean;
  verbose?: boolean;
}

export interface UserSeedData {
  user: User;
  categories: Category[];
  accounts: ReturnType<typeof generateAccounts>;
  transactions: ReturnType<typeof generateTransactions>;
  assets: ReturnType<typeof generateAssets>;
  liabilities: ReturnType<typeof generateLiabilities>;
  goals: ReturnType<typeof generateGoals>;
}

const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  {
    id: 'cat_income_salary',
    userId: '', // Will be set per user
    name: 'Salary',
    emoji: '💼',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_income_freelance',
    userId: '',
    name: 'Freelance',
    emoji: '💻',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_income_investment_returns',
    userId: '',
    name: 'Investment Returns',
    emoji: '📈',
    isDefault: true,
    createdAt: new Date(),
  },

  // Expense categories
  {
    id: 'cat_exp_rent',
    userId: '',
    name: 'Rent',
    emoji: '🏠',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_utilities',
    userId: '',
    name: 'Utilities',
    emoji: '💡',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_insurance',
    userId: '',
    name: 'Insurance',
    emoji: '🛡️',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_grocery',
    userId: '',
    name: 'Grocery',
    emoji: '🛒',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_dining',
    userId: '',
    name: 'Dining Out',
    emoji: '🍽️',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_shopping',
    userId: '',
    name: 'Shopping',
    emoji: '🛍️',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_transport',
    userId: '',
    name: 'Transportation',
    emoji: '🚗',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_medical',
    userId: '',
    name: 'Medical',
    emoji: '🏥',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_entertainment',
    userId: '',
    name: 'Entertainment',
    emoji: '🎬',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_travel',
    userId: '',
    name: 'Travel',
    emoji: '✈️',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_investment',
    userId: '',
    name: 'Investment',
    emoji: '📊',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_education',
    userId: '',
    name: 'Education',
    emoji: '📚',
    isDefault: true,
    createdAt: new Date(),
  },
  {
    id: 'cat_exp_emi',
    userId: '',
    name: 'EMI/Loan Payment',
    emoji: '💳',
    isDefault: true,
    createdAt: new Date(),
  },
];

/**
 * Test User 1: Aggressive Investor
 * Profile: High income, diversified portfolio, investments focused
 */
function createTestUser1(): UserSeedData {
  const userId = 'test_user_1';
  const user: User = {
    id: userId,
    name: 'Rajesh Kumar',
    email: 'testuser1@finsight.com',
    baseCurrency: 'INR',
    createdAt: new Date('2024-01-15'),
    avatarInitials: 'RK',
  };

  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    userId,
    id: `${userId}_${cat.id}`,
  }));

  const accounts = generateAccounts({ userId });
  const transactions = generateTransactions({
    userId,
    accountName: accounts[0].name,
    monthsBack: 6,
  });
  const assets = generateAssets({ userId });
  const liabilities = generateLiabilities({ userId });
  const goals = generateGoals({ userId });

  return {
    user,
    categories,
    accounts,
    transactions,
    assets,
    liabilities,
    goals,
  };
}

/**
 * Test User 2: Conservative Saver
 * Profile: Moderate income, safety-first approach, debt-conscious
 */
function createTestUser2(): UserSeedData {
  const userId = 'test_user_2';
  const user: User = {
    id: userId,
    name: 'Priya Sharma',
    email: 'testuser2@finsight.com',
    baseCurrency: 'INR',
    createdAt: new Date('2024-02-10'),
    avatarInitials: 'PS',
  };

  const categories = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    userId,
    id: `${userId}_${cat.id}`,
  }));

  const accounts = generateAccounts({ userId });
  const transactions = generateTransactions({
    userId,
    accountName: accounts[0].name,
    monthsBack: 6,
  });
  const assets = generateAssets({ userId });
  const liabilities = generateLiabilities({ userId });
  const goals = generateGoals({ userId });

  return {
    user,
    categories,
    accounts,
    transactions,
    assets,
    liabilities,
    goals,
  };
}

export function generateAllTestData(options: SeedDataOptions = {}): {
  user1: UserSeedData;
  user2: UserSeedData;
} {
  const { verbose = false } = options;

  if (verbose) {
    console.log('Generating test user 1 (Aggressive Investor)...');
  }
  const user1Data = createTestUser1();

  if (verbose) {
    console.log('Generating test user 2 (Conservative Saver)...');
  }
  const user2Data = createTestUser2();

  if (verbose) {
    console.log('Test data generation complete!');
    console.log(`User 1: ${user1Data.user.name} (${user1Data.user.email})`);
    console.log(`  - Accounts: ${user1Data.accounts.length}`);
    console.log(`  - Transactions: ${user1Data.transactions.length}`);
    console.log(`  - Assets: ${user1Data.assets.length}`);
    console.log(`  - Liabilities: ${user1Data.liabilities.length}`);
    console.log(`  - Goals: ${user1Data.goals.length}`);

    console.log(`User 2: ${user2Data.user.name} (${user2Data.user.email})`);
    console.log(`  - Accounts: ${user2Data.accounts.length}`);
    console.log(`  - Transactions: ${user2Data.transactions.length}`);
    console.log(`  - Assets: ${user2Data.assets.length}`);
    console.log(`  - Liabilities: ${user2Data.liabilities.length}`);
    console.log(`  - Goals: ${user2Data.goals.length}`);
  }

  return {
    user1: user1Data,
    user2: user2Data,
  };
}

export function getSeedDataSummary(data: {
  user1: UserSeedData;
  user2: UserSeedData;
}): {
  testUsers: Array<{ email: string; name: string; profile: string }>;
  dataVolume: {
    totalTransactions: number;
    totalAssets: number;
    totalLiabilities: number;
    totalGoals: number;
  };
} {
  return {
    testUsers: [
      {
        email: data.user1.user.email,
        name: data.user1.user.name,
        profile: 'Aggressive Investor',
      },
      {
        email: data.user2.user.email,
        name: data.user2.user.name,
        profile: 'Conservative Saver',
      },
    ],
    dataVolume: {
      totalTransactions:
        data.user1.transactions.length + data.user2.transactions.length,
      totalAssets: data.user1.assets.length + data.user2.assets.length,
      totalLiabilities:
        data.user1.liabilities.length + data.user2.liabilities.length,
      totalGoals: data.user1.goals.length + data.user2.goals.length,
    },
  };
}
