'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  actionText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/**
 * Confirmation dialog component used for delete operations and critical actions.
 * Features sliding animation and red styling for destructive actions.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  actionText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Dialog action failed:', error)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-bg2 border border-border rounded-2xl shadow-lg max-w-sm w-full animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-6 py-4 border-b border-border">
            {isDestructive && (
              <AlertCircle className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
            )}
            <h2 className="text-lg font-semibold text-text">
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-muted">
              {description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-border justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-border text-text hover:bg-bg3 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDestructive
                  ? 'bg-red/10 border-red/30 text-red hover:bg-red/20'
                  : 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
              }`}
            >
              {isLoading ? 'Loading...' : actionText}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
