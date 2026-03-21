import { Transaction, Asset, Liability, Goal } from '../types/index';

/**
 * Calculate net worth
 */
export function calculateNetWorth(totalAssets: number, totalLiabilities: number): number {
  return totalAssets - totalLiabilities;
}

/**
 * Calculate total value of all assets
 */
export function calculateTotalAssets(assets: Asset[]): number {
  return assets.reduce((sum, asset) => sum + asset.currentValue, 0);
}

/**
 * Calculate total outstanding liabilities
 */
export function calculateTotalLiabilities(liabilities: Liability[]): number {
  return liabilities.reduce((sum, liability) => sum + liability.outstandingAmount, 0);
}

/**
 * Calculate monthly spending for a specific month
 * @param transactions All transactions
 * @param month Month number (1-12)
 * @param year Year (optional, defaults to current year)
 */
export function calculateMonthlySpend(
  transactions: Transaction[],
  month: number,
  year?: number
): number {
  const currentYear = year || new Date().getFullYear();
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.date.getMonth() === month - 1 &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate monthly income for a specific month
 * @param transactions All transactions
 * @param month Month number (1-12)
 * @param year Year (optional, defaults to current year)
 */
export function calculateMonthlyIncome(
  transactions: Transaction[],
  month: number,
  year?: number
): number {
  const currentYear = year || new Date().getFullYear();
  return transactions
    .filter(
      (t) =>
        t.type === 'income' &&
        t.date.getMonth() === month - 1 &&
        t.date.getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Group expenses by category with percentages
 */
export function groupExpensesByCategory(
  transactions: Transaction[]
): Array<{ category: string; amount: number; percentage: number; emoji: string }> {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const categoryMap = new Map<
    string,
    { amount: number; emoji: string }
  >();

  expenses.forEach((expense) => {
    const key = expense.category;
    if (categoryMap.has(key)) {
      const existing = categoryMap.get(key)!;
      existing.amount += expense.amount;
    } else {
      categoryMap.set(key, { amount: expense.amount, emoji: expense.categoryEmoji });
    }
  });

  const totalExpenses = Array.from(categoryMap.values()).reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage:
        totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
      emoji: data.emoji,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Get most recent transactions
 */
export function getRecentTransactions(
  transactions: Transaction[],
  limit: number = 10
): Transaction[] {
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Calculate asset allocation by type
 */
export function calculateAssetAllocation(
  assets: Asset[]
): Array<{ type: string; value: number; percentage: number }> {
  const typeMap = new Map<string, number>();

  assets.forEach((asset) => {
    const key = asset.type;
    typeMap.set(key, (typeMap.get(key) || 0) + asset.currentValue);
  });

  const totalValue = Array.from(typeMap.values()).reduce((sum, val) => sum + val, 0);

  return Array.from(typeMap.entries())
    .map(([type, value]) => {
      const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
      return {
        type,
        value,
        percentage: isNaN(percentage) ? 0 : percentage, // Ensure no NaN values
      };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Calculate goal progress as a percentage (0-100)
 */
export function calculateGoalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  return Math.min(Math.round(progress), 100); // Cap at 100%
}

/**
 * Calculate net worth trend over a period
 * Calculates net worth at the end of each month
 */
export function getNetWorthTrend(
  transactions: Transaction[],
  assets: Asset[],
  period: '3m' | '6m' | '1y' = '3m'
): Array<{ date: string; value: number }> {
  const today = new Date();
  const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;

  const trend: Array<{ date: string; value: number }> = [];

  // Calculate for each month going back
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    // Calculate cumulative assets considering transactions
    let cumulativeAssets = calculateTotalAssets(assets);

    // Calculate cumulative liabilities
    let cumulativeLiabilities = 0;

    // For simplicity, we use current asset values
    // In a real app, you'd track historical asset values

    const netWorth = calculateNetWorth(cumulativeAssets, cumulativeLiabilities);

    // Format date based on period
    const monthStr = monthDate.toLocaleString('default', { month: 'short' });
    let dateStr: string;

    if (period === '1y') {
      // For 1Y view: use abbreviated format "Mar 26" to fit better
      const yearStr = year.toString().slice(-2); // "2026" -> "26"
      dateStr = `${monthStr} ${yearStr}`;
    } else {
      // For 3m/6m: use full format "Mar 2026"
      dateStr = `${monthStr} ${year}`;
    }

    trend.push({ date: dateStr, value: netWorth });
  }

  return trend;
}
