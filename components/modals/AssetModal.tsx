'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Asset } from '@/types/index'

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (asset: Partial<Asset>) => Promise<void>
  initialAsset?: Asset
  mode?: 'add' | 'edit'
}

type AssetType = Asset['type']

const QUANTITY_SUPPORTED_TYPES: AssetType[] = [
  'stocks',
  'international_equity',
  'gold',
  'crypto',
  'mutual_funds',
  'bonds',
]

const ASSET_TYPES: { type: AssetType; label: string; icon: string }[] = [
  { type: 'stocks', label: 'Stocks', icon: '📈' },
  { type: 'mutual_funds', label: 'Mutual Funds', icon: '🏦' },
  { type: 'gold', label: 'Gold', icon: '🪙' },
  { type: 'crypto', label: 'Crypto', icon: '₿' },
  { type: 'bank_fd', label: 'Bank/FD', icon: '🏧' },
  { type: 'cash', label: 'Cash', icon: '💰' },
  { type: 'international_equity', label: 'Global Equity', icon: '🌍' },
  { type: 'government_scheme', label: 'Govt Scheme', icon: '🏛️' },
  { type: 'bonds', label: 'Bonds', icon: '📜' },
  { type: 'retirement', label: 'Retirement', icon: '🛡️' },
  { type: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { type: 'other', label: 'Other', icon: '🧩' },
]

export function AssetModal({
  isOpen,
  onClose,
  onSubmit,
  initialAsset,
  mode = 'add',
}: AssetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks' as AssetType,
    currentValue: 0,
    units: 0,
    exchange: '',
    subType: '',
    investmentDate: '',
    goldUnit: 'grams' as 'grams' | 'ounces',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialAsset) {
      setFormData({
        name: initialAsset.name,
        type: initialAsset.type as AssetType,
        currentValue: initialAsset.currentValue,
        units: initialAsset.units || 0,
        exchange: initialAsset.exchange || '',
        subType: initialAsset.subType || '',
        investmentDate: initialAsset.investmentDate
          ? initialAsset.investmentDate.toISOString().split('T')[0]
          : '',
        goldUnit: 'grams',
        notes: initialAsset.notes || '',
      })
    } else {
      setFormData({
        name: '',
        type: 'stocks',
        currentValue: 0,
        units: 0,
        exchange: '',
        subType: '',
        investmentDate: '',
        goldUnit: 'grams',
        notes: '',
      })
    }
    setErrors({})
    setSubmitError(null)
  }, [initialAsset, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required'
    }

    if (formData.currentValue <= 0) {
      newErrors.currentValue = 'Current value must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const assetData: Partial<Asset> = {
      name: formData.name,
      type: formData.type,
      currentValue: formData.currentValue,
      investmentDate: formData.investmentDate ? new Date(formData.investmentDate) : undefined,
      notes: formData.notes,
    }

    if (QUANTITY_SUPPORTED_TYPES.includes(formData.type) && formData.units > 0) {
      assetData.units = formData.units
    }

    if (['stocks', 'international_equity', 'crypto'].includes(formData.type) && formData.exchange.trim()) {
      assetData.exchange = formData.exchange
    }

    if (formData.subType.trim()) {
      assetData.subType = formData.subType
    }

    try {
      await onSubmit(assetData)
      handleClose()
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'stocks',
      currentValue: 0,
      units: 0,
      exchange: '',
      subType: '',
      investmentDate: '',
      goldUnit: 'grams',
      notes: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg2 border border-border rounded-3xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-text">
            {mode === 'add' ? 'Add Asset' : 'Edit Asset'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError ? (
            <div className="p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
              {submitError}
            </div>
          ) : null}

          {/* Asset Type Selector */}
          <div>
            <label className="block text-sm font-medium text-text mb-3">
              Asset Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {ASSET_TYPES.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.type === type
                      ? 'border-accent bg-bg3 text-accent'
                      : 'border-border bg-bg hover:border-border2 text-text'
                  }`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Asset Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Reliance Industries"
              className={`w-full px-4 py-2.5 rounded-lg bg-bg3 border ${
                errors.name ? 'border-red' : 'border-border'
              } text-text placeholder-muted focus:outline-none focus:border-accent transition-colors`}
            />
            {errors.name && (
              <p className="text-red text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Current Value Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Current Value (Base Currency) *
            </label>
            <input
              type="number"
              value={formData.currentValue || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentValue: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              className={`w-full px-4 py-2.5 rounded-lg bg-bg3 border ${
                errors.currentValue ? 'border-red' : 'border-border'
              } text-text placeholder-muted focus:outline-none focus:border-accent transition-colors`}
            />
            {errors.currentValue && (
              <p className="text-red text-sm mt-1">{errors.currentValue}</p>
            )}
          </div>

          {/* Conditional: Units/Quantity */}
          {QUANTITY_SUPPORTED_TYPES.includes(formData.type) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {formData.type === 'gold' ? 'Quantity' : 'Units'} <span className="text-muted">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.units || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      units: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-lg bg-bg3 border ${
                    errors.units ? 'border-red' : 'border-border'
                  } text-text placeholder-muted focus:outline-none focus:border-accent transition-colors`}
                />
              </div>

              {/* Gold Unit Selector */}
              {formData.type === 'gold' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.goldUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goldUnit: e.target.value as 'grams' | 'ounces',
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="grams">Grams</option>
                    <option value="ounces">Ounces</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Market / Exchange */}
          {['stocks', 'international_equity', 'crypto'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Market / Platform / Exchange
              </label>
              <input
                type="text"
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                placeholder={
                  formData.type === 'international_equity'
                    ? 'e.g., NASDAQ, NYSE, LSE'
                    : formData.type === 'crypto'
                      ? 'e.g., Binance, Coinbase, Kraken'
                      : 'e.g., NSE, BSE'
                }
                className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {/* Scheme / Variant */}
          {['mutual_funds', 'government_scheme', 'bonds', 'retirement', 'other'].includes(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Scheme / Variant
              </label>
              <input
                type="text"
                value={formData.subType}
                onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
                placeholder={
                  formData.type === 'mutual_funds'
                    ? 'e.g., Direct, Growth, Index'
                    : formData.type === 'government_scheme'
                      ? 'e.g., PPF, SSY, NSC'
                      : formData.type === 'retirement'
                        ? 'e.g., NPS, EPF, IRA'
                        : 'Enter scheme or variant'
                }
                className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {/* Investment Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Investment Date
            </label>
            <input
              type="date"
              value={formData.investmentDate}
              onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any notes about this asset..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-bg3 border border-border text-text hover:bg-bg4 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Asset' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
