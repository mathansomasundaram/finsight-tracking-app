export interface User {
  id: string;
  name: string;
  email: string;
  baseCurrency: string; // "INR" for V1
  createdAt: Date;
  avatarInitials: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  balance: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string; // Category name
  categoryEmoji: string;
  accountName: string;
  description: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type:
    | 'stocks'
    | 'mutual_funds'
    | 'gold'
    | 'crypto'
    | 'bank_fd'
    | 'cash'
    | 'government_scheme'
    | 'international_equity'
    | 'bonds'
    | 'real_estate'
    | 'retirement'
    | 'other';
  currentValue: number;
  units?: number;
  subType?: string;
  exchange?: string;
  investmentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Liability {
  id: string;
  userId: string;
  name: string;
  type: 'personal_loan' | 'credit_card' | 'informal_loan';
  totalAmount: number;
  outstandingAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  currentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlySpend: number;
  monthlyIncome: number;
  expensesByCategory: { category: string; amount: number; percentage: number; emoji: string }[];
  netWorthTrend: { date: string; value: number }[];
  recentTransactions: Transaction[];
  assetAllocation: { type: string; value: number; percentage: number }[];
}

export interface DashboardExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  emoji: string;
}

export interface DashboardTrendPoint {
  date: string;
  value: number;
}

export interface DashboardRecentTransaction {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryEmoji: string;
  accountName: string;
  description: string;
}

export interface DashboardSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlySpend: number;
  monthlyIncome: number;
  expensesByCategory: DashboardExpenseCategory[];
  netWorthTrend: DashboardTrendPoint[];
  recentTransactions: DashboardRecentTransaction[];
}
