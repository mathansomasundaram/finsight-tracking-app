'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  iconClassName?: string
}

/**
 * Empty state component for when no data is available.
 * Displays an icon, title, description, and optional action button.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconClassName = 'w-16 h-16',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="mb-4 text-muted2">
        <Icon className={iconClassName} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-text mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-accent/10 text-accent border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors duration-150 font-medium text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
