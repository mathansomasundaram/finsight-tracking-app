/**
 * Central export file for all Supabase CRUD services
 */

// Export Transaction Service
export {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getTransactions,
  getTransactionsByMonth,
  subscribeToTransactions,
} from './transactionService'

// Export Asset Service
export {
  addAsset,
  updateAsset,
  deleteAsset,
  deleteAllAssets,
  getAssets,
  getAssetsByType,
  subscribeToAssets,
} from './assetService'

// Export Liability Service
export {
  addLiability,
  updateLiability,
  deleteLiability,
  deleteAllLiabilities,
  getLiabilities,
  getLiabilitiesByType,
  subscribeToLiabilities,
} from './liabilityService'

// Export Goal Service
export {
  addGoal,
  updateGoal,
  deleteGoal,
  getGoals,
  subscribeToGoals,
} from './goalService'

// Export Account Service
export {
  addAccount,
  updateAccount,
  deleteAccount,
  getAccounts,
  getActiveAccounts,
  subscribeToAccounts,
} from './accountService'

// Export Category Service
export {
  getDefaultCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getDefaultUserCategories,
  getCustomCategories,
  subscribeToCategories,
} from './categoryService'

// Export Dashboard Service
export {
  getDashboardSummary,
  subscribeToDashboardSummary,
} from './dashboardService'
