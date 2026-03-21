import { supabase } from '@/lib/supabase'
import {
  DashboardSummary,
  DashboardExpenseCategory,
  DashboardTrendPoint,
  DashboardRecentTransaction,
} from '@/types/index'

type DashboardPeriod = '3m' | '6m' | '1y'

interface DashboardSummaryRow {
  total_assets: number | string | null
  total_liabilities: number | string | null
  net_worth: number | string | null
  monthly_spend: number | string | null
  monthly_income: number | string | null
  expenses_by_category: Array<{
    category: string
    amount: number | string
    percentage: number | string
    emoji: string
  }> | null
  net_worth_trend: Array<{
    date: string
    value: number | string
  }> | null
  recent_transactions: Array<{
    id: string
    date: string
    type: 'income' | 'expense'
    amount: number | string
    category: string
    category_emoji: string
    account_name: string
    description: string
  }> | null
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function mapDashboardSummary(row: DashboardSummaryRow | null): DashboardSummary {
  const expensesByCategory: DashboardExpenseCategory[] = (row?.expenses_by_category || []).map((item) => ({
    category: item.category,
    amount: toNumber(item.amount),
    percentage: Math.round(toNumber(item.percentage)),
    emoji: item.emoji,
  }))

  const netWorthTrend: DashboardTrendPoint[] = (row?.net_worth_trend || []).map((item) => ({
    date: item.date,
    value: toNumber(item.value),
  }))

  const recentTransactions: DashboardRecentTransaction[] = (row?.recent_transactions || []).map((item) => ({
    id: item.id,
    date: new Date(item.date),
    type: item.type,
    amount: toNumber(item.amount),
    category: item.category,
    categoryEmoji: item.category_emoji,
    accountName: item.account_name,
    description: item.description,
  }))

  return {
    totalAssets: toNumber(row?.total_assets),
    totalLiabilities: toNumber(row?.total_liabilities),
    netWorth: toNumber(row?.net_worth),
    monthlySpend: toNumber(row?.monthly_spend),
    monthlyIncome: toNumber(row?.monthly_income),
    expensesByCategory,
    netWorthTrend,
    recentTransactions,
  }
}

export async function getDashboardSummary(
  period: DashboardPeriod = '3m'
): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc('get_dashboard_summary', {
    p_period: period,
  })

  if (error) {
    console.error('Error fetching dashboard summary:', error)
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  return mapDashboardSummary((row ?? null) as DashboardSummaryRow | null)
}

export function subscribeToDashboardSummary(
  userId: string,
  period: DashboardPeriod,
  callback: (summary: DashboardSummary) => void,
  onError?: (error: Error) => void
): () => void {
  let isActive = true

  const loadSummary = () => {
    getDashboardSummary(period)
      .then((summary) => {
        if (isActive) {
          callback(summary)
        }
      })
      .catch((err) => {
        if (isActive && onError) {
          onError(err as Error)
        }
      })
  }

  loadSummary()

  const channels = ['transactions', 'assets', 'liabilities'].map((table) =>
    supabase
      .channel(`dashboard:${table}:${period}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadSummary()
        }
      )
      .subscribe()
  )

  return () => {
    isActive = false
    channels.forEach((channel) => {
      void supabase.removeChannel(channel)
    })
  }
}
