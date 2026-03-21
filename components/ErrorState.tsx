'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

/**
 * Error state component for displaying error messages with retry option.
 * Uses red accent for visibility.
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-red/5 border border-red/20 rounded-2xl">
      {/* Error Icon */}
      <div className="mb-4">
        <AlertCircle className="w-12 h-12 text-red" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text mb-2 text-center">
        {title}
      </h3>

      {/* Message */}
      <p className="text-muted text-center max-w-sm mb-6">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red/10 text-red border border-red/30 rounded-lg hover:bg-red/20 transition-colors duration-150 font-medium text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
