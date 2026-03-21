'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  count?: number
  height?: string
  width?: string
}

/**
 * Generic skeleton loader component that animates with a pulse effect.
 * Matches dark theme colors.
 */
export function Skeleton({ className = '', count = 1, height = 'h-12', width = 'w-full' }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse rounded-lg bg-bg3 ${height} ${width} ${className}`}
        />
      ))}
    </>
  )
}

/**
 * Skeleton for card layouts
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-bg2 border border-border rounded-2xl p-5 space-y-4 animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-5 bg-bg3 rounded w-1/3" />
            <div className="h-4 bg-bg3 rounded w-12" />
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            <div className="h-4 bg-bg3 rounded w-full" />
            <div className="h-4 bg-bg3 rounded w-5/6" />
          </div>

          {/* Footer */}
          <div className="flex gap-2">
            <div className="h-4 bg-bg3 rounded-full flex-1" />
            <div className="h-4 bg-bg3 rounded-full w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 bg-bg2 border border-border rounded-lg p-4 animate-pulse"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 bg-bg3 rounded flex-1"
              style={{ width: `${100 / columns}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton for chart placeholders
 */
export function ChartSkeleton() {
  return (
    <div className="bg-bg2 border border-border rounded-2xl p-5 animate-pulse">
      {/* Title */}
      <div className="h-6 bg-bg3 rounded w-1/4 mb-4" />

      {/* Chart area */}
      <div className="h-64 bg-bg3 rounded-lg" />

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-bg4 rounded-full" />
            <div className="h-4 bg-bg3 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for form inputs
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-2">
          {/* Label */}
          <div className="h-4 bg-bg3 rounded w-1/4" />

          {/* Input field */}
          <div className="h-10 bg-bg3 rounded-lg" />
        </div>
      ))}

      {/* Submit button */}
      <div className="h-10 bg-bg3 rounded-lg w-1/4 mt-6" />
    </div>
  )
}

/**
 * Skeleton for list items
 */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 bg-bg2 border border-border rounded-lg p-4 animate-pulse"
        >
          {/* Avatar/Icon */}
          <div className="w-10 h-10 bg-bg3 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-bg3 rounded w-1/3" />
            <div className="h-3 bg-bg3 rounded w-1/2" />
          </div>

          {/* Value */}
          <div className="h-4 bg-bg3 rounded w-1/5" />
        </div>
      ))}
    </div>
  )
}
