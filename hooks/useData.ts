'use client'

/**
 * Provider-agnostic data hook entrypoint.
 * Swap this module's exports if the app moves away from Supabase.
 */
export {
  useTransactions,
  useAssets,
  useLiabilities,
  useGoals,
  useAccounts,
  useCategories,
} from './useSupabaseData'
