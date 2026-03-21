'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Account } from '@/types/index'

interface AccountModalProps {
  isOpen: boolean
  mode: 'add' | 'edit'
  account?: Account
  onClose: () => void
  onSubmit: (data: Omit<Account, 'id' | 'userId' | 'createdAt'>) => Promise<void>
}

const accountTypes: Array<Account['type']> = ['bank', 'credit_card', 'cash', 'wallet']

export function AccountModal({ isOpen, mode, account, onClose, onSubmit }: AccountModalProps) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: (account?.type || 'bank') as Account['type'],
    balance: account?.balance || 0,
    isActive: account?.isActive !== undefined ? account.isActive : true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required'
    }

    if (mode === 'add' && formData.balance < 0) {
      newErrors.balance = 'Initial balance cannot be negative'
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

    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        balance: formData.balance,
        isActive: formData.isActive,
      })

      setFormData({
        name: '',
        type: 'bank',
        balance: 0,
        isActive: true,
      })
      setErrors({})
      onClose()
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg2 border border-border rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-text">
            {mode === 'add' ? 'Add Account' : 'Edit Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError ? (
            <div className="p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
              {submitError}
            </div>
          ) : null}

          {/* Account Name */}
          <div>
            <label className="block text-13 font-medium text-text mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., HDFC Savings"
              className={`w-full px-3 py-2 rounded-lg bg-bg3 border text-text placeholder-muted transition-colors ${
                errors.name ? 'border-red' : 'border-border hover:border-border2'
              }`}
            />
            {errors.name && <p className="text-red text-12 mt-1">{errors.name}</p>}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-13 font-medium text-text mb-2">
              Account Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
              className="w-full px-3 py-2 rounded-lg bg-bg3 border border-border text-text transition-colors hover:border-border2"
            >
              {accountTypes.map((type) => (
                <option key={type} value={type} className="bg-bg2">
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Initial Balance (only for add mode) */}
          {mode === 'add' && (
            <div>
              <label className="block text-13 font-medium text-text mb-2">
                Initial Balance (₹)
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={`w-full px-3 py-2 rounded-lg bg-bg3 border text-text placeholder-muted transition-colors ${
                  errors.balance ? 'border-red' : 'border-border hover:border-border2'
                }`}
              />
              {errors.balance && <p className="text-red text-12 mt-1">{errors.balance}</p>}
            </div>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="isActive" className="text-13 text-text cursor-pointer">
              Active Account
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-bg3 border border-border text-text hover:bg-bg4 transition-colors font-medium text-13"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium text-13"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Account' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
