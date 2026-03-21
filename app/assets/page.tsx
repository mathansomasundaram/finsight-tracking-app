'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Download } from 'lucide-react'
import { Asset } from '@/types/index'
import { useAuth } from '@/hooks/useAuth'
import { useAssets as useAssetsHook, useAccounts as useAccountsHook } from '@/hooks/useData'
import { addAsset, updateAsset, deleteAsset } from '@/lib/services'
import { calculateAssetAllocation } from '@/lib/calculations'
import { AssetModal } from '@/components/modals/AssetModal'
import { CSVImportModal } from '@/components/modals/CSVImportModal'
import { exportAssetsCSV } from '@/lib/csvExport'
import { CardSkeleton } from '@/components/ui/Skeleton'

const ASSET_TYPE_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  stocks: {
    label: 'Stocks',
    icon: '📈',
    color: 'text-blue',
    bgColor: 'bg-blue/10',
  },
  mutual_funds: {
    label: 'Mutual Funds',
    icon: '🏦',
    color: 'text-purple',
    bgColor: 'bg-purple/10',
  },
  gold: {
    label: 'Gold',
    icon: '🪙',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  crypto: {
    label: 'Crypto',
    icon: '₿',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  bank_fd: {
    label: 'Bank/FD',
    icon: '🏧',
    color: 'text-teal',
    bgColor: 'bg-teal/10',
  },
  government_scheme: {
    label: 'Government Schemes',
    icon: '🏛️',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  international_equity: {
    label: 'Global Equity',
    icon: '🌍',
    color: 'text-blue',
    bgColor: 'bg-blue/10',
  },
  bonds: {
    label: 'Bonds',
    icon: '📜',
    color: 'text-teal',
    bgColor: 'bg-teal/10',
  },
  retirement: {
    label: 'Retirement',
    icon: '🛡️',
    color: 'text-purple',
    bgColor: 'bg-purple/10',
  },
  real_estate: {
    label: 'Real Estate',
    icon: '🏠',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
  },
  cash: {
    label: 'Cash',
    icon: '💰',
    color: 'text-accent2',
    bgColor: 'bg-accent2/10',
  },
  other: {
    label: 'Other Investments',
    icon: '🧩',
    color: 'text-text',
    bgColor: 'bg-bg3',
  },
}

const PROGRESS_BAR_COLORS = [
  'bg-blue',
  'bg-purple',
  'bg-amber',
  'bg-accent',
  'bg-teal',
  'bg-accent2',
]

interface AssetItem extends Asset {
  displayUnits?: number | string
  sourceCount?: number
}

type AssetGroupMode = 'entry' | 'name' | 'type' | 'scheme' | 'year'

export default function Assets() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { assets: assetRecords, isLoading: isAssetsLoading } = useAssetsHook(user?.id || null)
  const { accounts } = useAccountsHook(user?.id || null)
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetItem | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [groupMode, setGroupMode] = useState<AssetGroupMode>('entry')
  const isLoading = isAuthLoading || isAssetsLoading

  // Keep an editable local copy while realtime updates remain the source of truth.
  useEffect(() => {
    setAssets(assetRecords)
  }, [assetRecords])

  const assetAllocation = useMemo(
    () => calculateAssetAllocation(assets),
    [assets]
  )

  const totalAssetValue = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.currentValue, 0),
    [assets]
  )

  const groupedAssets = useMemo(() => {
    const grouped = new Map<string, AssetItem[]>()

    if (groupMode === 'entry') {
      assets.forEach((asset) => {
        if (!grouped.has(asset.type)) {
          grouped.set(asset.type, [])
        }
        grouped.get(asset.type)!.push(asset)
      })

      return grouped
    }

    if (groupMode === 'name') {
      const aggregated = new Map<string, AssetItem>()

      assets.forEach((asset) => {
        const key = `${asset.type}:${asset.name.trim().toLowerCase()}`
        const existing = aggregated.get(key)

        if (existing) {
          existing.currentValue += asset.currentValue
          existing.units = (existing.units || 0) + (asset.units || 0)
          existing.sourceCount = (existing.sourceCount || 1) + 1
          if (existing.exchange !== asset.exchange) existing.exchange = undefined
          if (existing.subType !== asset.subType) existing.subType = undefined
        } else {
          aggregated.set(key, {
            ...asset,
            units: asset.units || 0,
            sourceCount: 1,
          })
        }
      })

      aggregated.forEach((asset) => {
        if (!grouped.has(asset.type)) {
          grouped.set(asset.type, [])
        }
        grouped.get(asset.type)!.push(asset)
      })

      return grouped
    }

    if (groupMode === 'scheme') {
      assets.forEach((asset) => {
        const schemeKey = asset.subType?.trim() || 'Unspecified'
        if (!grouped.has(schemeKey)) {
          grouped.set(schemeKey, [])
        }
        grouped.get(schemeKey)!.push(asset)
      })

      return grouped
    }

    if (groupMode === 'year') {
      assets.forEach((asset) => {
        const yearKey = asset.investmentDate
          ? asset.investmentDate.getFullYear().toString()
          : 'No Date'
        if (!grouped.has(yearKey)) {
          grouped.set(yearKey, [])
        }
        grouped.get(yearKey)!.push(asset)
      })

      return grouped
    }

    assets.forEach((asset) => {
      const key = asset.type
      const existing = grouped.get(key)?.[0]

      if (existing) {
        existing.currentValue += asset.currentValue
        existing.units = (existing.units || 0) + (asset.units || 0)
        existing.sourceCount = (existing.sourceCount || 1) + 1
        existing.exchange = undefined
        existing.subType = undefined
      } else {
        grouped.set(key, [
          {
            ...asset,
            name: ASSET_TYPE_CONFIG[asset.type]?.label || asset.type,
            units: asset.units || 0,
            sourceCount: 1,
            exchange: undefined,
            subType: undefined,
          },
        ])
      }
    })

    return grouped
  }, [assets, groupMode])

  const handleAddAsset = async (assetData: Partial<Asset>) => {
    if (!user) return
    try {
      const assetId = await addAsset(user.id, {
        name: assetData.name || '',
        type: assetData.type || 'stocks',
        currentValue: assetData.currentValue || 0,
        units: assetData.units,
        exchange: assetData.exchange,
        subType: assetData.subType,
        investmentDate: assetData.investmentDate,
        notes: assetData.notes,
      })
      setAssets((prev) => [
        {
          id: assetId,
          userId: user.id,
          name: assetData.name || '',
          type: assetData.type || 'stocks',
          currentValue: assetData.currentValue || 0,
          units: assetData.units,
          exchange: assetData.exchange,
          subType: assetData.subType,
          investmentDate: assetData.investmentDate,
          notes: assetData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ])
    } catch (error) {
      console.error('Error adding asset:', error)
      throw error
    }
  }

  const handleEditAsset = async (assetData: Partial<Asset>) => {
    if (!editingAsset || !user) return
    try {
      await updateAsset(user.id, editingAsset.id, assetData)
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === editingAsset.id
            ? { ...asset, ...assetData, updatedAt: new Date() }
            : asset
        )
      )
      setEditingAsset(undefined)
    } catch (error) {
      console.error('Error updating asset:', error)
      throw error
    }
  }

  const handleDeleteAsset = async (id: string) => {
    if (!user) return
    try {
      await deleteAsset(user.id, id)
      setAssets((prev) => prev.filter((asset) => asset.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting asset:', error)
      throw error
    }
  }

  const handleOpenModal = (asset?: AssetItem) => {
    if (asset) {
      setEditingAsset(asset)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAsset(undefined)
  }

  const handleCSVExport = () => {
    exportAssetsCSV(assets)
  }

  const handleCSVImport = () => {
    setIsImportModalOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const isEmpty = assets.length === 0

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2 flex-1 animate-pulse">
            <div className="h-8 bg-bg3 rounded w-1/3" />
            <div className="h-4 bg-bg3 rounded w-1/2" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-bg3 rounded w-24 animate-pulse" />
            <div className="h-10 bg-bg3 rounded w-24 animate-pulse" />
            <div className="h-10 bg-bg3 rounded w-28 animate-pulse" />
          </div>
        </div>

        {/* Main content grid skeleton */}
        <div className="grid grid-cols-3 gap-7">
          <div className="col-span-2 space-y-4">
            <CardSkeleton count={3} />
          </div>
          <div className="col-span-1 space-y-4">
            <div className="bg-bg2 border border-border rounded-3xl p-6 animate-pulse">
              <div className="h-6 bg-bg3 rounded w-1/2 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="h-4 bg-bg3 rounded w-1/3" />
                    <div className="h-2 bg-bg3 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-7 space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-text mb-1">Assets</h1>
          <p className="text-muted">
            Manage and track all your assets in one place
          </p>
          <p className="text-xs text-muted mt-2">
            Assets now support broader categories like global equity, government schemes, retirement, bonds, and other investments.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCSVImport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg2 border border-border text-text hover:bg-bg3 transition-colors font-medium"
          >
            Import CSV
          </button>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg2 border border-border text-text hover:bg-bg3 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {isEmpty ? (
        // Empty State
        <div className="bg-bg2 border border-border rounded-3xl p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="font-display text-xl text-text mb-2">
            No assets yet
          </h3>
          <p className="text-muted mb-6">
            Add your first asset to get started and start tracking your
            investments.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-7">
          {/* Main Content */}
          <div className="col-span-2 space-y-4">
            <div className="bg-bg2 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-text">View Holdings</h2>
                <p className="text-xs text-muted">
                  Combine duplicate buys into one holding or keep each entry separate.
                </p>
              </div>
              <select
                value={groupMode}
                onChange={(e) => setGroupMode(e.target.value as AssetGroupMode)}
                className="px-3 py-2 rounded-lg bg-bg3 border border-border text-text focus:outline-none focus:border-accent"
              >
                <option value="entry">Individual Entries</option>
                <option value="name">Group by Asset Name</option>
                <option value="type">Group by Asset Type</option>
                <option value="scheme">Group by Scheme / Variant</option>
                <option value="year">Group by Year</option>
              </select>
            </div>

            {Array.from(groupedAssets.entries()).map(([type, typeAssets]) => {
              const config = ASSET_TYPE_CONFIG[type]
              const sectionLabel =
                groupMode === 'year'
                  ? type
                  : groupMode === 'scheme'
                    ? type
                    : config?.label || type
              const sectionIcon =
                groupMode === 'year'
                  ? '🗓️'
                  : groupMode === 'scheme'
                    ? '🧾'
                    : config?.icon || '📦'
              const sectionColor =
                groupMode === 'year' || groupMode === 'scheme'
                  ? 'text-text'
                  : config?.color || 'text-text'
              const sectionBg =
                groupMode === 'year' || groupMode === 'scheme'
                  ? 'bg-bg3'
                  : config?.bgColor || 'bg-bg3'

              return (
                <div
                  key={type}
                  className="bg-bg2 border border-border rounded-3xl overflow-hidden"
                >
                  {/* Section Header */}
                  <div className={`${sectionBg} px-6 py-4 border-b border-border`}>
                    <h3 className={`font-display text-lg ${sectionColor} flex items-center gap-2`}>
                      <span className="text-2xl">{sectionIcon}</span>
                      {sectionLabel}
                    </h3>
                  </div>

                  {/* Assets List */}
                  <div className="divide-y divide-border">
                    {typeAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="px-6 py-4 hover:bg-bg3 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-text">
                                {asset.name}
                              </h4>
                              {groupMode !== 'entry' && (asset.sourceCount || 1) > 1 && (
                                <span className="text-xs bg-accent/10 px-2 py-1 rounded text-accent">
                                  {asset.sourceCount} entries
                                </span>
                              )}
                              {asset.units !== undefined && (
                                <span className="text-xs bg-bg3 px-2 py-1 rounded text-muted">
                                  {asset.units} {asset.type === 'gold' ? 'g' : 'units'}
                                </span>
                              )}
                              {asset.exchange && (
                                <span className="text-xs bg-bg3 px-2 py-1 rounded text-muted">
                                  {asset.exchange}
                                </span>
                              )}
                              {asset.subType && (
                                <span className="text-xs bg-bg3 px-2 py-1 rounded text-muted capitalize">
                                  {asset.subType}
                                </span>
                              )}
                              {asset.investmentDate && (
                                <span className="text-xs bg-bg3 px-2 py-1 rounded text-muted">
                                  {asset.investmentDate.getFullYear()}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted">
                              {groupMode === 'entry'
                                ? asset.notes || 'No notes'
                                : groupMode === 'name'
                                  ? `Combined holding for ${asset.name}`
                                  : groupMode === 'scheme'
                                    ? `Total value across entries tagged as ${type}`
                                    : groupMode === 'year'
                                      ? `Total value for investments recorded in ${type}`
                                      : `Total value across all ${(config?.label || type).toLowerCase()} holdings`}
                            </div>
                          </div>

                          <div className="text-right mr-16">
                            <div className="text-lg font-semibold text-text">
                              {formatCurrency(asset.currentValue)}
                            </div>
                            {asset.units && asset.units > 0 && (
                              <div className="text-sm text-muted">
                                ₹
                                {formatCurrency(
                                  asset.currentValue / asset.units
                                ).replace('₹', '')}
                                /unit
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {groupMode === 'entry' ? (
                              <>
                                <button
                                  onClick={() => handleOpenModal(asset)}
                                  className="p-2 hover:bg-bg3 rounded-lg text-accent transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(asset.id)}
                                  className="p-2 hover:bg-bg3 rounded-lg text-red transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        {/* Delete Confirmation */}
                        {groupMode === 'entry' && deleteConfirm === asset.id && (
                          <div className="mt-4 p-3 bg-red/10 border border-red rounded-lg flex items-center justify-between">
                            <span className="text-red text-sm">
                              Are you sure you want to delete this asset?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 text-sm rounded-lg bg-bg3 hover:bg-bg4 text-text transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteAsset(asset.id)
                                }
                                className="px-3 py-1 text-sm rounded-lg bg-red text-white hover:bg-red/80 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            {/* Allocation Breakdown */}
            <div className="sticky top-7 space-y-4">
              <div className="bg-bg2 border border-border rounded-3xl p-6">
                <h3 className="font-display text-lg text-text mb-6">
                  Asset Allocation
                </h3>

                <div className="space-y-4 mb-6">
                  {assetAllocation.map((allocation, index) => {
                    const config = ASSET_TYPE_CONFIG[allocation.type]
                    if (!config) return null

                    const percentage = allocation.percentage ?? 0;

                    return (
                      <div key={allocation.type}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-text flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            {config.label}
                          </span>
                          <span className="text-sm font-medium text-text">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-bg3 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              PROGRESS_BAR_COLORS[index] || PROGRESS_BAR_COLORS[0]
                            } rounded-full transition-all duration-300`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted mt-1">
                          {formatCurrency(allocation.value)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">
                      Total Assets
                    </span>
                    <span className="text-lg font-semibold text-accent">
                      {formatCurrency(totalAssetValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accounts Breakdown */}
              <div className="bg-bg2 border border-border rounded-3xl p-6">
                <h3 className="font-display text-lg text-text mb-4">
                  Accounts
                </h3>

                <div className="space-y-3 mb-4">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">
                          {account.name}
                        </p>
                        <p className="text-xs text-muted capitalize">
                          {account.type}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-accent">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  ))}
                </div>

                <button className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-bg3 hover:bg-bg4 text-text border border-border transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingAsset ? handleEditAsset : handleAddAsset}
        initialAsset={editingAsset}
        mode={editingAsset ? 'edit' : 'add'}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}
