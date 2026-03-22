/**
 * Central export file for all calculations, mock data, and utilities
 */

// Export all calculation functions
export {
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
} from './calculations';

// Export all mock data
export {
  mockUser,
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockAssets,
  mockLiabilities,
  mockGoals,
  generateMockDashboardData,
  getMockData,
} from './mockData';

// Export verification utilities
export { verifyAllCalculations } from './verifyCalculations';

// Export utility functions
export {
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
} from './utils';

// Export chart utilities
export {
  formatChartData,
  getChartColors,
  formatChartAxis,
  getTopCategories,
  formatExpenseByCategoryForChart,
  getCategoryColor,
  type ChartDataPoint,
} from './chartUtils';

// Export validation schemas and types
export {
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
} from './validation';

// Export theme context
export {
  ThemeProvider,
  useTheme,
  getThemeColor,
} from './ThemeContext';
export { THEME_COLORS, type Theme } from './themeTokens';

// Export Supabase CRUD services
export {
  // Transaction services
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getTransactions,
  getTransactionsByMonth,
  subscribeToTransactions,
  // Asset services
  addAsset,
  updateAsset,
  deleteAsset,
  deleteAllAssets,
  getAssets,
  getAssetsByType,
  subscribeToAssets,
  // Liability services
  addLiability,
  updateLiability,
  deleteLiability,
  deleteAllLiabilities,
  getLiabilities,
  getLiabilitiesByType,
  subscribeToLiabilities,
  // Goal services
  addGoal,
  updateGoal,
  deleteGoal,
  getGoals,
  subscribeToGoals,
  // Account services
  addAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
  getActiveAccounts,
  subscribeToAccounts,
  // Category services
  getDefaultCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getDefaultUserCategories,
  getCustomCategories,
  subscribeToCategories,
  getDashboardSummary,
  subscribeToDashboardSummary,
} from './services'
