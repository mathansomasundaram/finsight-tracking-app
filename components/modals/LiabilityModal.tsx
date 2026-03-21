'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Liability } from '@/types/index'

interface LiabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (liability: Omit<Liability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  initialData?: Liability
  mode: 'add' | 'edit'
}

export function LiabilityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: LiabilityModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'personal_loan' | 'credit_card' | 'informal_loan'>(
    'personal_loan'
  )
  const [totalAmount, setTotalAmount] = useState('')
  const [outstandingAmount, setOutstandingAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name)
      setType(initialData.type)
      setTotalAmount(initialData.totalAmount.toString())
      setOutstandingAmount(initialData.outstandingAmount.toString())
      setNotes(initialData.notes || '')
    } else {
      resetForm()
    }
  }, [isOpen, mode, initialData])

  const resetForm = () => {
    setName('')
    setType('personal_loan')
    setTotalAmount('')
    setOutstandingAmount('')
    setNotes('')
    setErrors({})
    setSubmitError(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!totalAmount) {
      newErrors.totalAmount = 'Total amount is required'
    } else if (isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount must be a positive number'
    }

    if (!outstandingAmount) {
      newErrors.outstandingAmount = 'Outstanding amount is required'
    } else if (isNaN(Number(outstandingAmount)) || Number(outstandingAmount) < 0) {
      newErrors.outstandingAmount = 'Outstanding amount must be a non-negative number'
    } else if (Number(outstandingAmount) > Number(totalAmount)) {
      newErrors.outstandingAmount = 'Outstanding amount cannot exceed total amount'
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
        name: name.trim(),
        type,
        totalAmount: Number(totalAmount),
        outstandingAmount: Number(outstandingAmount),
        notes: notes.trim() || undefined,
      })

      resetForm()
      onClose()
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save liability')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg2 border border-border rounded-2xl shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-lg text-text">
            {mode === 'add' ? 'Add Liability' : 'Edit Liability'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError ? (
            <div className="p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
              {submitError}
            </div>
          ) : null}

          {/* Name */}
          <div>
            <label className="block text-sm text-text mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home Loan"
              className={`w-full bg-bg3 border rounded-lg px-3 py-2 text-text placeholder:text-muted2 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                errors.name ? 'border-red' : 'border-border'
              }`}
            />
            {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-text mb-2">Type</label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'personal_loan' | 'credit_card' | 'informal_loan')
              }
              className="w-full bg-bg3 border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="personal_loan">Personal Loan</option>
              <option value="credit_card">Credit Card</option>
              <option value="informal_loan">Informal Loan</option>
            </select>
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm text-text mb-2">Total Amount (₹)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0"
              className={`w-full bg-bg3 border rounded-lg px-3 py-2 text-text placeholder:text-muted2 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                errors.totalAmount ? 'border-red' : 'border-border'
              }`}
            />
            {errors.totalAmount && <p className="text-red text-xs mt-1">{errors.totalAmount}</p>}
          </div>

          {/* Outstanding Amount */}
          <div>
            <label className="block text-sm text-text mb-2">Outstanding Amount (₹)</label>
            <input
              type="number"
              value={outstandingAmount}
              onChange={(e) => setOutstandingAmount(e.target.value)}
              placeholder="0"
              className={`w-full bg-bg3 border rounded-lg px-3 py-2 text-text placeholder:text-muted2 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                errors.outstandingAmount ? 'border-red' : 'border-border'
              }`}
            />
            {errors.outstandingAmount && (
              <p className="text-red text-xs mt-1">{errors.outstandingAmount}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-text mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this liability..."
              rows={3}
              className="w-full bg-bg3 border border-border rounded-lg px-3 py-2 text-text placeholder:text-muted2 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-bg3 border border-border text-text rounded-lg hover:bg-bg4 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Liability' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
