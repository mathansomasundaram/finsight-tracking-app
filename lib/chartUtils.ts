import { Transaction, Category } from '../types/index'
import { formatDate } from './utils'

export interface ChartDataPoint {
  date: string
  value: number
  [key: string]: any
}

/**
 * Format chart data from transactions for a specific time period
 */
export function formatChartData(
  transactions: Transaction[],
  period: '3m' | '6m' | '1y' = '3m'
): ChartDataPoint[] {
  const today = new Date()
  const months = period === '3m' ? 3 : period === '6m' ? 6 : 12

  // Group transactions by month
  const monthlyData = new Map<string, number>()

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()

    // Calculate total for this month
    const monthTotal = transactions
      .filter(
        (t) =>
          t.type === 'income' &&
          t.date.getMonth() === month &&
          t.date.getFullYear() === year
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const dateStr = `${monthDate.toLocaleString('default', { month: 'short' })} ${year}`
    monthlyData.set(dateStr, monthTotal)
  }

  return Array.from(monthlyData.entries()).map(([date, value]) => ({
    date,
    value,
  }))
}

/**
 * Get chart color palette
 */
export function getChartColors() {
  return {
    primary: '#c8f060', // Accent green
    secondary: '#5b9cf6', // Blue
    accent: '#f5a623', // Amber
    success: '#4ecdc4', // Teal
    danger: '#ff6b6b', // Red
    warning: '#f5a623', // Amber
    purple: '#b794f4',
  }
}

/**
 * Format chart axis labels for large numbers
 * Example: 150000 -> "1.5L", 1000000 -> "10L"
 */
export function formatChartAxis(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1000000) {
    return `₹${(value / 1000000).toFixed(1)}Cr`
  } else if (absValue >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`
  } else if (absValue >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`
  } else {
    return `₹${value}`
  }
}

/**
 * Get top categories by spending
 */
export function getTopCategories(
  transactions: Transaction[],
  limit: number = 5
): Array<{ category: string; amount: number; emoji: string }> {
  const categoryMap = new Map<
    string,
    { amount: number; emoji: string }
  >()

  // Only include expenses
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((expense) => {
      const key = expense.category
      if (categoryMap.has(key)) {
        const existing = categoryMap.get(key)!
        existing.amount += expense.amount
      } else {
        categoryMap.set(key, {
          amount: expense.amount,
          emoji: expense.categoryEmoji,
        })
      }
    })

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      emoji: data.emoji,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit)
}

/**
 * Format expense data by category for pie chart
 */
export function formatExpenseByCategoryForChart(
  transactions: Transaction[]
): Array<{ name: string; value: number; emoji: string }> {
  const categoryMap = new Map<
    string,
    { value: number; emoji: string }
  >()

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((expense) => {
      const key = expense.category
      if (categoryMap.has(key)) {
        const existing = categoryMap.get(key)!
        existing.value += expense.amount
      } else {
        categoryMap.set(key, {
          value: expense.amount,
          emoji: expense.categoryEmoji,
        })
      }
    })

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      name: `${data.emoji} ${category}`,
      value: data.value,
      emoji: data.emoji,
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * Get color for specific category based on index
 */
export function getCategoryColor(index: number): string {
  const colors = [
    '#c8f060', // Primary green
    '#5b9cf6', // Blue
    '#f5a623', // Amber
    '#4ecdc4', // Teal
    '#b794f4', // Purple
    '#ff6b6b', // Red
    '#ff9f43', // Orange
    '#2ecc71', // Light green
  ]

  return colors[index % colors.length]
}
