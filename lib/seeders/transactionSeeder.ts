import { Transaction } from '../../types/index';
import { subMonths, subDays, startOfMonth, endOfMonth, setDate } from 'date-fns';

export interface TransactionSeederOptions {
  userId: string;
  accountName: string;
  monthsBack?: number;
}

interface TransactionTemplate {
  category: string;
  categoryEmoji: string;
  type: 'income' | 'expense';
  descriptions: string[];
  amountRange: [number, number];
  frequency?: 'monthly' | 'weekly' | 'daily' | 'random';
}

const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  // Income
  {
    category: 'Salary',
    categoryEmoji: '💼',
    type: 'income',
    descriptions: ['Monthly Salary', 'Salary Transfer', 'Payroll'],
    amountRange: [200000, 250000],
    frequency: 'monthly',
  },
  {
    category: 'Freelance',
    categoryEmoji: '💻',
    type: 'income',
    descriptions: ['Freelance Project', 'Consulting Work', 'Side Project'],
    amountRange: [15000, 50000],
    frequency: 'random',
  },
  {
    category: 'Investment Returns',
    categoryEmoji: '📈',
    type: 'income',
    descriptions: ['Dividend Income', 'Interest Received', 'Investment Returns'],
    amountRange: [5000, 20000],
    frequency: 'random',
  },

  // Fixed Expenses
  {
    category: 'Rent',
    categoryEmoji: '🏠',
    type: 'expense',
    descriptions: ['Monthly Rent', 'House Rent', 'Apartment Rent'],
    amountRange: [40000, 50000],
    frequency: 'monthly',
  },
  {
    category: 'Utilities',
    categoryEmoji: '💡',
    type: 'expense',
    descriptions: ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Recharge'],
    amountRange: [2000, 5000],
    frequency: 'monthly',
  },
  {
    category: 'Insurance',
    categoryEmoji: '🛡️',
    type: 'expense',
    descriptions: ['Health Insurance Premium', 'Car Insurance', 'Life Insurance'],
    amountRange: [5000, 15000],
    frequency: 'monthly',
  },

  // Variable Expenses
  {
    category: 'Grocery',
    categoryEmoji: '🛒',
    type: 'expense',
    descriptions: [
      'Grocery Shopping',
      'Fruits & Vegetables',
      'Supermarket',
      'Daily Essentials',
    ],
    amountRange: [3000, 8000],
    frequency: 'weekly',
  },
  {
    category: 'Dining Out',
    categoryEmoji: '🍽️',
    type: 'expense',
    descriptions: [
      'Restaurant',
      'Coffee Shop',
      'Lunch',
      'Dinner with Friends',
      'Cafe',
      'Swiggy/Zomato',
    ],
    amountRange: [300, 2000],
    frequency: 'daily',
  },
  {
    category: 'Shopping',
    categoryEmoji: '🛍️',
    type: 'expense',
    descriptions: [
      'Clothing',
      'Electronics',
      'Books',
      'Online Shopping',
      'Amazon',
      'Lifestyle',
    ],
    amountRange: [1000, 10000],
    frequency: 'random',
  },
  {
    category: 'Transportation',
    categoryEmoji: '🚗',
    type: 'expense',
    descriptions: [
      'Fuel',
      'Auto Rickshaw',
      'Taxi',
      'Metro Card',
      'Parking',
      'Car Maintenance',
    ],
    amountRange: [500, 3000],
    frequency: 'weekly',
  },
  {
    category: 'Medical',
    categoryEmoji: '🏥',
    type: 'expense',
    descriptions: [
      'Doctor Appointment',
      'Medicines',
      'Pharmacy',
      'Health Checkup',
    ],
    amountRange: [1000, 8000],
    frequency: 'random',
  },
  {
    category: 'Entertainment',
    categoryEmoji: '🎬',
    type: 'expense',
    descriptions: [
      'Movie Tickets',
      'Concert',
      'Gaming',
      'Streaming Subscription',
      'OTT',
    ],
    amountRange: [500, 3000],
    frequency: 'random',
  },
  {
    category: 'Travel',
    categoryEmoji: '✈️',
    type: 'expense',
    descriptions: [
      'Flight Ticket',
      'Hotel',
      'Train Ticket',
      'Vacation',
      'Trip Expenses',
    ],
    amountRange: [5000, 50000],
    frequency: 'random',
  },
  {
    category: 'Investment',
    categoryEmoji: '📊',
    type: 'expense',
    descriptions: [
      'Stock Purchase',
      'Mutual Fund Investment',
      'SIP',
      'Crypto Purchase',
      'Gold Purchase',
    ],
    amountRange: [10000, 100000],
    frequency: 'random',
  },
  {
    category: 'Education',
    categoryEmoji: '📚',
    type: 'expense',
    descriptions: [
      'Course Fee',
      'Books',
      'Online Course',
      'Skill Development',
    ],
    amountRange: [2000, 15000],
    frequency: 'random',
  },
  {
    category: 'EMI/Loan Payment',
    categoryEmoji: '💳',
    type: 'expense',
    descriptions: [
      'Car EMI',
      'Home Loan EMI',
      'Personal Loan EMI',
      'Loan Repayment',
    ],
    amountRange: [10000, 50000],
    frequency: 'monthly',
  },
];

function getRandomAmount(range: [number, number]): number {
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDescription(descriptions: string[]): string {
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateTransactionsForDay(
  date: Date,
  template: TransactionTemplate,
  baseId: number
): Transaction[] {
  const transactions: Transaction[] = [];

  if (template.frequency === 'daily' && Math.random() > 0.3) {
    transactions.push({
      id: `txn_${baseId}_${transactions.length}`,
      userId: '',
      date,
      type: template.type,
      amount: getRandomAmount(template.amountRange),
      category: template.category,
      categoryEmoji: template.categoryEmoji,
      accountName: '',
      description: getRandomDescription(template.descriptions),
      createdAt: date,
      updatedAt: date,
    });
  } else if (template.frequency === 'weekly' && Math.random() > 0.5) {
    transactions.push({
      id: `txn_${baseId}_${transactions.length}`,
      userId: '',
      date,
      type: template.type,
      amount: getRandomAmount(template.amountRange),
      category: template.category,
      categoryEmoji: template.categoryEmoji,
      accountName: '',
      description: getRandomDescription(template.descriptions),
      createdAt: date,
      updatedAt: date,
    });
  }

  return transactions;
}

export function generateTransactions(
  options: TransactionSeederOptions
): Transaction[] {
  const { userId, accountName, monthsBack = 6 } = options;
  const transactions: Transaction[] = [];
  let transactionId = 1;

  const today = new Date();
  const startDate = subMonths(today, monthsBack);

  // Generate transactions for each month
  for (let monthOffset = monthsBack; monthOffset >= 0; monthOffset--) {
    const monthStart = subMonths(today, monthOffset);
    const monthStartDate = startOfMonth(monthStart);
    const monthEndDate = endOfMonth(monthStart);

    // Monthly recurring transactions (salary, rent, EMI, etc.)
    const monthlyTemplates = TRANSACTION_TEMPLATES.filter(
      (t) => t.frequency === 'monthly'
    );
    monthlyTemplates.forEach((template) => {
      const dayOfMonth = monthOffset === monthsBack ? 1 : 1; // First of month for most
      const transactionDate = setDate(monthStart, dayOfMonth);

      transactions.push({
        id: `txn_${transactionId++}`,
        userId,
        date: transactionDate,
        type: template.type,
        amount: getRandomAmount(template.amountRange),
        category: template.category,
        categoryEmoji: template.categoryEmoji,
        accountName,
        description: getRandomDescription(template.descriptions),
        createdAt: transactionDate,
        updatedAt: transactionDate,
      });
    });

    // Weekly and daily transactions throughout the month
    let currentDate = new Date(monthStartDate);
    while (currentDate <= monthEndDate) {
      // Weekly transactions
      const weeklyTemplates = TRANSACTION_TEMPLATES.filter(
        (t) => t.frequency === 'weekly'
      );
      weeklyTemplates.forEach((template) => {
        if (Math.random() > 0.4) {
          transactions.push({
            id: `txn_${transactionId++}`,
            userId,
            date: new Date(currentDate),
            type: template.type,
            amount: getRandomAmount(template.amountRange),
            category: template.category,
            categoryEmoji: template.categoryEmoji,
            accountName,
            description: getRandomDescription(template.descriptions),
            createdAt: new Date(currentDate),
            updatedAt: new Date(currentDate),
          });
        }
      });

      // Daily transactions
      const dailyTemplates = TRANSACTION_TEMPLATES.filter(
        (t) => t.frequency === 'daily'
      );
      dailyTemplates.forEach((template) => {
        if (Math.random() > 0.35) {
          transactions.push({
            id: `txn_${transactionId++}`,
            userId,
            date: new Date(currentDate),
            type: template.type,
            amount: getRandomAmount(template.amountRange),
            category: template.category,
            categoryEmoji: template.categoryEmoji,
            accountName,
            description: getRandomDescription(template.descriptions),
            createdAt: new Date(currentDate),
            updatedAt: new Date(currentDate),
          });
        }
      });

      // Random transactions
      const randomTemplates = TRANSACTION_TEMPLATES.filter(
        (t) => t.frequency === 'random'
      );
      if (Math.random() > 0.7) {
        const template =
          randomTemplates[Math.floor(Math.random() * randomTemplates.length)];
        transactions.push({
          id: `txn_${transactionId++}`,
          userId,
          date: new Date(currentDate),
          type: template.type,
          amount: getRandomAmount(template.amountRange),
          category: template.category,
          categoryEmoji: template.categoryEmoji,
          accountName,
          description: getRandomDescription(template.descriptions),
          createdAt: new Date(currentDate),
          updatedAt: new Date(currentDate),
        });
      }

      currentDate = subDays(currentDate, -1);
    }
  }

  // Update IDs to be unique
  return transactions.map((txn, idx) => ({
    ...txn,
    id: `txn_${userId}_${idx}`,
  }));
}
