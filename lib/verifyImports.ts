/**
 * Verification file to ensure all imports and exports are working correctly
 * This file is NOT imported anywhere - it's just for validation
 */

// Test all utility imports
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateShort,
  getMonthName,
  getDaysInMonth,
  formatPercentage,
  getProgressColor,
  generateId,
  convertToCSV,
  downloadFile,
  truncateText,
  getDaysBetween,
  formatDuration,
} from './utils'

// Test chart utilities
import {
  formatChartData,
  getChartColors,
  formatChartAxis,
  getTopCategories,
  formatExpenseByCategoryForChart,
  getCategoryColor,
  type ChartDataPoint,
} from './chartUtils'

// Test validation schemas
import {
  transactionSchema,
  assetSchema,
  liabilitySchema,
  goalSchema,
  accountSchema,
  userSchema,
  categorySchema,
  type TransactionFormData,
  type AssetFormData,
  type LiabilityFormData,
  type GoalFormData,
  type AccountFormData,
  type UserFormData,
  type CategoryFormData,
} from './validation'

// Test theme context
import {
  ThemeProvider,
  useTheme,
  getThemeColor,
} from './ThemeContext'
import { THEME_COLORS, type Theme } from './themeTokens'

// Test calculations
import {
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateMonthlySpend,
  calculateMonthlyIncome,
  groupExpensesByCategory,
  getRecentTransactions,
  calculateAssetAllocation,
  calculateGoalProgress,
  getNetWorthTrend,
} from './calculations'

// Test mock data
import {
  mockUser,
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockAssets,
  mockLiabilities,
  mockGoals,
  generateMockDashboardData,
  getMockData,
} from './mockData'

// Test CSV export
import {
  exportTransactionsCSV,
  exportAssetsCSV,
  exportLiabilitiesCSV,
} from './csvExport'

console.log('All imports verified successfully!')
