'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardSummary, subscribeToDashboardSummary } from '@/lib/services'
import { DashboardSummary } from '@/types/index'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CardSkeleton } from '@/components/ui/Skeleton'

// SVG Line Chart Component (since Recharts might not be installed)
function NetWorthChart({ data }: { data: Array<{ date: string; value: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 bg-bg3 rounded-lg flex items-center justify-center text-muted">
        No data available
      </div>
    )
  }

  const width = 600
  const height = 250
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const normalizedValue = (d.value - minValue) / range
    const y = padding.top + chartHeight - normalizedValue * chartHeight
    return { x, y, value: d.value, label: d.date }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const labelStep = data.length > 6 ? Math.ceil(data.length / 6) : 1

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Y-axis */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(138, 136, 144, 0.3)" />

        {/* X-axis */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(138, 136, 144, 0.3)" />

        {/* Grid lines and labels */}
        {points.map((p, i) => {
          const isEdgeLabel = i === 0 || i === points.length - 1
          const isTooCloseToLastLabel = points.length - 1 - i < labelStep
          const showLabel = isEdgeLabel || (i % labelStep === 0 && !isTooCloseToLastLabel)
          const textAnchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'

          return (
            <g key={`grid-${i}`}>
              <line x1={p.x} y1={height - padding.bottom} x2={p.x} y2={height - padding.bottom + 5} stroke="rgba(138, 136, 144, 0.2)" />
              {showLabel ? (
                <text x={p.x} y={height - padding.bottom + 20} textAnchor={textAnchor} fontSize="11" fill="rgba(138, 136, 144, 0.7)">
                  {p.label}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const yValue = Math.round(minValue + tick * range)
          const y = padding.top + chartHeight - tick * chartHeight
          return (
            <g key={`y-tick-${tick}`}>
              <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="rgba(138, 136, 144, 0.2)" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(138, 136, 144, 0.6)">
                ₹{(yValue / 1000).toFixed(0)}k
              </text>
            </g>
          )
        })}

        {/* Line chart */}
        <polyline points={polylinePoints} fill="none" stroke="rgb(200, 240, 96)" strokeWidth="2" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={`point-${i}`} cx={p.x} cy={p.y} r="4" fill="rgb(200, 240, 96)" />
        ))}
      </svg>
    </div>
  )
}

// Donut Chart Component
function AssetsVsLiabilitiesChart({
  assets,
  liabilities,
}: {
  assets: number
  liabilities: number
}) {
  const total = assets + liabilities
  const hasAllocationData = total > 0
  const assetsPercent = hasAllocationData ? (assets / total) * 100 : 0
  const liabilitiesPercent = hasAllocationData ? (liabilities / total) * 100 : 0

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const assetsDash = `${(assetsPercent / 100) * circumference} ${circumference}`
  const liabilitiesDash = `${(liabilitiesPercent / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(138, 136, 144, 0.16)"
          strokeWidth="20"
        />
        {/* Assets donut */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgb(200, 240, 96)"
          strokeWidth="20"
          strokeDasharray={assetsDash}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        {/* Liabilities donut */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(138, 136, 144, 0.3)"
          strokeWidth="20"
          strokeDasharray={liabilitiesDash}
          strokeDashoffset={-((assetsPercent / 100) * circumference)}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        {/* Center text */}
        <text x="100" y="95" textAnchor="middle" fontSize="20" fontWeight="bold" fill="rgb(200, 240, 96)">
          {hasAllocationData ? `${Math.round(assetsPercent)}%` : '—'}
        </text>
        <text x="100" y="115" textAnchor="middle" fontSize="12" fill="rgba(138, 136, 144, 0.7)">
          {hasAllocationData ? 'Assets' : 'No data'}
        </text>
      </svg>

      <div className="space-y-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm text-text">Assets</span>
          </div>
          <span className="text-sm font-medium text-text">₹{(assets / 100000).toFixed(2)}L</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted opacity-30"></div>
            <span className="text-sm text-text">Liabilities</span>
          </div>
          <span className="text-sm font-medium text-text">₹{(liabilities / 100000).toFixed(2)}L</span>
        </div>
      </div>
    </div>
  )
}

// Bar Chart for Expenses
function ExpensesCategoryChart({
  data,
}: {
  data: Array<{ category: string; amount: number; percentage: number; emoji: string }>
}) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  return (
    <div className="space-y-4">
      {data.slice(0, 5).map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-sm text-text font-medium">{item.category}</span>
            </div>
            <span className="text-sm text-muted">{item.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-bg3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(item.amount / maxAmount) * 100}%`,
                backgroundColor: [
                  'rgb(200, 240, 96)',
                  'rgb(91, 156, 246)',
                  'rgb(78, 205, 196)',
                  'rgb(183, 148, 244)',
                  'rgb(255, 107, 107)',
                ][i % 5],
              }}
            />
          </div>
          <div className="text-xs text-muted mt-1">₹{item.amount.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

// Format currency
function formatCurrency(amount: number): string {
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + 'Cr'
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + 'L'
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(2) + 'K'
  return '₹' + amount.toFixed(0)
}

export default function Dashboard() {
  const [period, setPeriod] = useState<'3m' | '6m' | '1y'>('3m')
  const { user, isLoading: isAuthLoading } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setSummary(null)
      setSummaryError(null)
      setIsSummaryLoading(false)
      return
    }

    setIsSummaryLoading(true)
    setSummaryError(null)

    const unsubscribe = subscribeToDashboardSummary(
      user.id,
      period,
      (data) => {
        setSummary(data)
        setSummaryError(null)
        setIsSummaryLoading(false)
      },
      (error) => {
        console.error('Error subscribing to dashboard summary:', error)
        setSummaryError('Failed to keep dashboard in sync')
        setIsSummaryLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, period])

  const isLoading = isAuthLoading || isSummaryLoading
  const totalAssets = summary?.totalAssets ?? 0
  const totalLiabilities = summary?.totalLiabilities ?? 0
  const currentNetWorth = summary?.netWorth ?? 0
  const currentMonthSpend = summary?.monthlySpend ?? 0
  const currentMonthIncome = summary?.monthlyIncome ?? 0
  const expensesByCategory = summary?.expensesByCategory ?? []
  const recentTransactions = summary?.recentTransactions ?? []
  const netWorthTrend = summary?.netWorthTrend ?? []
  const hasNetWorthInputs = totalAssets > 0 || totalLiabilities > 0

  // Calculate month-on-month change only when the dashboard has enough balance-sheet data.
  const previousMonthNetWorth = netWorthTrend[netWorthTrend.length - 2]?.value
  const hasNetWorthComparison =
    hasNetWorthInputs &&
    previousMonthNetWorth !== undefined &&
    previousMonthNetWorth !== currentNetWorth
  const netWorthChange = hasNetWorthComparison && previousMonthNetWorth !== undefined
    ? currentNetWorth - previousMonthNetWorth
    : 0
  const netWorthChangePercent = hasNetWorthComparison && previousMonthNetWorth
    ? ((netWorthChange / previousMonthNetWorth) * 100).toFixed(1)
    : null
  const isPositiveChange = netWorthChange >= 0

  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-bg3 rounded w-1/3" />
          <div className="h-5 bg-bg3 rounded w-1/2" />
        </div>

        {/* Hero card skeleton */}
        <div className="bg-bg2 border border-border rounded-3xl p-8 animate-pulse">
          <div className="h-16 bg-bg3 rounded mb-4 w-1/3" />
          <div className="h-32 bg-bg3 rounded" />
        </div>

        {/* KPI Cards skeleton */}
        <CardSkeleton count={4} />

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((idx) => (
            <div key={idx} className="bg-bg2 border border-border rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-bg3 rounded w-1/4 mb-4" />
              <div className="h-64 bg-bg3 rounded" />
            </div>
          ))}
        </div>

        {/* Recent transactions skeleton */}
        <div className="bg-bg2 border border-border rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-bg3 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-12 bg-bg3 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-7 space-y-6 animate-fade-in">
      {summaryError ? (
        <div className="bg-red/10 border border-red/30 rounded-2xl px-4 py-3 text-sm text-red">
          {summaryError}
        </div>
      ) : null}

      {/* Hero Section - Net Worth Card */}
      <div className="bg-gradient-to-br from-bg2 to-bg3 border border-border rounded-3xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Net Worth Info */}
          <div className="flex-1">
            <h2 className="font-display text-5xl text-text mb-2">
              {formatCurrency(currentNetWorth)}
            </h2>
            <p className="text-muted mb-4">Total Net Worth</p>

            <div className="flex items-center gap-4">
              {hasNetWorthComparison && netWorthChangePercent ? (
                <>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${isPositiveChange ? 'bg-accent bg-opacity-10' : 'bg-red bg-opacity-10'}`}>
                    {isPositiveChange ? (
                      <TrendingUp className="w-4 h-4 text-accent" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red" />
                    )}
                    <span className={`text-sm font-medium ${isPositiveChange ? 'text-accent' : 'text-red'}`}>
                      {isPositiveChange ? '+' : ''}{netWorthChangePercent}%
                    </span>
                  </div>
                  <span className="text-sm text-muted">vs last month</span>
                </>
              ) : (
                <span className="text-sm text-muted">
                  {hasNetWorthInputs
                    ? 'No prior month comparison yet'
                    : 'Add assets or liabilities to unlock net worth insights'}
                </span>
              )}
            </div>
          </div>

          {/* Right: Period Selector */}
          <div className="flex gap-2">
            {(['3m', '6m', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-accent text-contrast border border-accent'
                    : 'bg-bg3 text-muted hover:text-text border border-border hover:border-border2'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8 -mx-4 -mb-4 bg-bg bg-opacity-40 rounded-b-3xl p-4">
          {hasNetWorthInputs ? (
            <NetWorthChart data={netWorthTrend} />
          ) : (
            <div className="w-full h-64 bg-bg rounded-2xl flex items-center justify-center text-center px-6 text-muted">
              Net worth trend is hidden until you add assets or liabilities. Transactions by themselves do not reconstruct historical net worth.
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets Card */}
        <div className="bg-bg2 border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted mb-1">Total Assets</p>
              <h3 className="font-display text-3xl text-text">{formatCurrency(totalAssets)}</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-accent opacity-60" />
          </div>
          <div className="text-xs text-muted">Live total from tracked assets</div>
        </div>

        {/* Total Liabilities Card */}
        <div className="bg-bg2 border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted mb-1">Total Liabilities</p>
              <h3 className="font-display text-3xl text-text">{formatCurrency(totalLiabilities)}</h3>
            </div>
            <TrendingDown className="w-5 h-5 text-red opacity-60" />
          </div>
          <div className="text-xs text-muted">Live total from tracked liabilities</div>
        </div>

        {/* Monthly Spend Card */}
        <div className="bg-bg2 border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Monthly Spend</p>
          <h3 className="font-display text-3xl text-text mb-4">{formatCurrency(currentMonthSpend)}</h3>
          <div className="space-y-2">
            {expensesByCategory.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="text-muted">{cat.category}</span>
                </div>
                <span className="text-text font-medium">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="bg-bg2 border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Monthly Income</p>
          <h3 className="font-display text-3xl text-text">{formatCurrency(currentMonthIncome)}</h3>
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent bg-opacity-10 w-fit">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span className="text-xs text-accent font-medium">On Track</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets vs Liabilities */}
        <div className="bg-bg2 border border-border rounded-2xl p-6">
          <h3 className="font-display text-xl text-text mb-6">Asset Allocation</h3>
          <AssetsVsLiabilitiesChart
            assets={totalAssets}
            liabilities={totalLiabilities}
          />
        </div>

        {/* Expenses by Category */}
        <div className="bg-bg2 border border-border rounded-2xl p-6">
          <h3 className="font-display text-xl text-text mb-6">Expenses by Category</h3>
          <ExpensesCategoryChart data={expensesByCategory} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h3 className="font-display text-xl text-text mb-6">Recent Transactions</h3>

        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Account</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn, i) => (
                  <tr
                    key={txn.id}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-bg3 bg-opacity-30' : ''}`}
                  >
                    <td className="py-3 px-4 text-sm text-text">
                      {txn.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-text">{txn.description}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{txn.categoryEmoji}</span>
                        <span className="text-muted">{txn.category}</span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-sm font-medium text-right ${
                      txn.type === 'income' ? 'text-accent' : 'text-text'
                    }`}>
                      {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{txn.accountName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted">No transactions yet. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
