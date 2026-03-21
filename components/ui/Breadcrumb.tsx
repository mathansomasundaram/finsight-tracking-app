'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb navigation component with mobile-friendly responsive layout
 * Collapses on mobile to save space
 */
export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm overflow-x-auto pb-2 ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home link */}
      <Link
        href="/"
        className="flex items-center gap-1 text-muted hover:text-text transition-colors flex-shrink-0"
      >
        <Home className="w-4 h-4" />
        <span className="hidden md:inline">Home</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1 md:gap-2">
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted flex-shrink-0" />

          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="text-muted hover:text-text transition-colors whitespace-nowrap truncate"
            >
              {item.label}
            </Link>
          ) : (
            <span className={`whitespace-nowrap truncate ${
              item.active ? 'text-accent font-medium' : 'text-muted'
            }`}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
