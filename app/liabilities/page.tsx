'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Download, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLiabilities as useLiabilitiesHook } from '@/hooks/useData'
import { addLiability, updateLiability, deleteLiability, deleteAllLiabilities } from '@/lib/services'
import { calculateTotalLiabilities } from '@/lib/calculations'
import { LiabilityModal } from '@/components/modals/LiabilityModal'
import { CSVImportModal } from '@/components/modals/CSVImportModal'
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal'
import { Liability } from '@/types/index'
import { exportLiabilitiesCSV } from '@/lib/csvExport'
import { TableRowSkeleton } from '@/components/ui/Skeleton'

export default function Liabilities() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { liabilities: liabilityRecords, isLoading: isLiabilitiesLoading } = useLiabilitiesHook(user?.id || null)
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedLiability, setSelectedLiability] = useState<Liability | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)
  const isLoading = isAuthLoading || isLiabilitiesLoading

  // Keep an editable local copy while realtime updates remain the source of truth.
  useEffect(() => {
    setLiabilities(liabilityRecords)
  }, [liabilityRecords])

  const totalLiabilities = calculateTotalLiabilities(liabilities)

  const getTotalByType = (type: string) => {
    return liabilities
      .filter((l) => l.type === type)
      .reduce((sum, l) => sum + l.outstandingAmount, 0)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'personal_loan':
        return '🏦'
      case 'credit_card':
        return '💳'
      case 'informal_loan':
        return '👤'
      default:
        return '📋'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'personal_loan':
        return 'Personal Loan'
      case 'credit_card':
        return 'Credit Card'
      case 'informal_loan':
        return 'Informal Loan'
      default:
        return type
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleAddLiability = () => {
    setSelectedLiability(undefined)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const handleEditLiability = (liability: Liability) => {
    setSelectedLiability(liability)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleSubmitModal = async (
    data: Omit<Liability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return
    try {
      if (modalMode === 'add') {
        const liabilityId = await addLiability(user.id, data)
        setLiabilities((prev) => [
          {
            id: liabilityId,
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
          },
          ...prev,
        ])
      } else if (selectedLiability) {
        await updateLiability(user.id, selectedLiability.id, data)
        setLiabilities((prev) =>
          prev.map((liability) =>
            liability.id === selectedLiability.id
              ? { ...liability, ...data, updatedAt: new Date() }
              : liability
          )
        )
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving liability:', error)
      throw error
    }
  }

  const handleDeleteLiability = async (id: string) => {
    if (!user) return
    try {
      await deleteLiability(user.id, id)
      setLiabilities((prev) => prev.filter((liability) => liability.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting liability:', error)
      throw error
    }
  }

  const handleExportCSV = () => {
    exportLiabilitiesCSV(liabilities)
  }

  const handleImportCSV = () => {
    setIsImportModalOpen(true)
  }

  const handleDeleteAllLiabilities = async () => {
    if (!user || isBulkDeleting) return

    try {
      setIsBulkDeleting(true)
      await deleteAllLiabilities(user.id)
      setLiabilities([])
      setIsClearAllOpen(false)
    } catch (error) {
      console.error('Error deleting all liabilities:', error)
      throw error
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const outstandingTotal = liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0)

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-bg3 rounded w-1/3 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 bg-bg3 rounded w-24 animate-pulse" />
            <div className="h-10 bg-bg3 rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-bg2 border border-border rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-bg3 rounded w-1/2 mb-3" />
              <div className="h-6 bg-bg3 rounded w-2/3" />
            </div>
          ))}
        </div>

        {/* List skeleton */}
        <TableRowSkeleton rows={5} columns={4} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-7 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-text">Liabilities</h1>
        <div className="flex gap-3">
          <button
            onClick={handleImportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-bg2 border border-border text-text rounded-lg hover:bg-bg3 transition-colors font-medium"
          >
            Import CSV
          </button>
          {liabilities.length > 0 && (
            <button
              onClick={() => setIsClearAllOpen(true)}
              className="px-4 py-2 rounded-lg bg-red/10 border border-red/25 text-red hover:bg-red/15 transition-colors font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleAddLiability}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Liability
          </button>
        </div>
      </div>

      {liabilities.length === 0 ? (
        // Empty State
        <div className="bg-bg2 border border-border rounded-3xl p-12 text-center">
          <div className="mb-4 text-4xl">✨</div>
          <h2 className="font-display text-xl text-text mb-2">No liabilities</h2>
          <p className="text-muted mb-6">
            Great financial health! You have no liabilities to track.
          </p>
          <button
            onClick={handleAddLiability}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Liability
          </button>
        </div>
      ) : (
        <>
          {/* Summary Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Total Liabilities */}
            <div className="bg-bg2 border border-border rounded-2xl p-5 lg:col-span-1">
              <p className="text-sm text-muted mb-2">Total Liabilities</p>
              <p className="font-display text-2xl text-red mb-3">{formatCurrency(totalLiabilities)}</p>
              <p className="text-xs text-muted2">
                Outstanding: {formatCurrency(outstandingTotal)}
              </p>
            </div>

            {/* Personal Loans */}
            <div className="bg-bg2 border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏦</span>
                <p className="text-sm text-muted">Personal Loans</p>
              </div>
              <p className="font-display text-xl text-text">
                {formatCurrency(getTotalByType('personal_loan'))}
              </p>
            </div>

            {/* Credit Cards */}
            <div className="bg-bg2 border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💳</span>
                <p className="text-sm text-muted">Credit Cards</p>
              </div>
              <p className="font-display text-xl text-text">
                {formatCurrency(getTotalByType('credit_card'))}
              </p>
            </div>

            {/* Informal Loans */}
            <div className="bg-bg2 border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👤</span>
                <p className="text-sm text-muted">Informal Loans</p>
              </div>
              <p className="font-display text-xl text-text">
                {formatCurrency(getTotalByType('informal_loan'))}
              </p>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-bg2 border border-border text-text rounded-lg hover:bg-bg3 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Liabilities List */}
          <div className="space-y-4">
            {liabilities.map((liability) => {
              const progress = (liability.outstandingAmount / liability.totalAmount) * 100
              const isHighProgress = progress > 75
              const isMediumProgress = progress > 50

              return (
                <div key={liability.id} className="bg-bg2 border border-border rounded-2xl p-5">
                  {/* Row 1: Type, Name, Amounts */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-4">
                    {/* Type and Name */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(liability.type)}</span>
                        <div>
                          <p className="text-sm text-muted">{getTypeLabel(liability.type)}</p>
                          <p className="font-medium text-text">{liability.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="text-right">
                      <p className="text-xs text-muted mb-1">Total Amount</p>
                      <p className="font-medium text-text">{formatCurrency(liability.totalAmount)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted mb-1">Outstanding</p>
                      <p className="font-medium text-red">{formatCurrency(liability.outstandingAmount)}</p>
                    </div>
                  </div>

                  {/* Row 2: Progress Bar and Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Progress Bar */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-bg3 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isHighProgress
                                ? 'bg-red'
                                : isMediumProgress
                                  ? 'bg-amber'
                                  : 'bg-accent'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted2 w-12 text-right">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      {liability.notes && (
                        <p className="text-xs text-muted2 line-clamp-1">{liability.notes}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end md:col-span-2">
                      <button
                        onClick={() => handleEditLiability(liability)}
                        className="flex items-center gap-2 px-3 py-2 bg-bg3 border border-border text-text rounded-lg hover:bg-bg4 transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      {deleteConfirm === liability.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteLiability(liability.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-red/20 border border-red text-red rounded-lg hover:bg-red/30 transition-colors text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex items-center gap-2 px-3 py-2 bg-bg3 border border-border text-text rounded-lg hover:bg-bg4 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(liability.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-bg3 border border-border text-text rounded-lg hover:border-red hover:text-red transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Liability Modal */}
      <LiabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={selectedLiability}
        mode={modalMode}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={isClearAllOpen}
        title="Clear All Liabilities"
        description="This will remove every tracked liability from the page. This action cannot be undone from the app."
        onConfirm={handleDeleteAllLiabilities}
        onCancel={() => setIsClearAllOpen(false)}
        isLoading={isBulkDeleting}
        confirmLabel="Delete All"
        loadingLabel="Deleting All..."
      />
    </div>
  )
}
