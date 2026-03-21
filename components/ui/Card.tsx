'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
}

/**
 * Card component with consistent styling and responsive spacing
 */
export function Card({
  children,
  className = '',
  hoverable = false,
  clickable = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-bg2 border border-border rounded-2xl p-4 md:p-5 lg:p-6 transition-all duration-150 ${
        hoverable
          ? 'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10'
          : ''
      } ${clickable ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Card header component
 */
interface CardHeaderProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="font-display text-lg md:text-xl text-text mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-muted">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * Card content component
 */
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

/**
 * Card footer component
 */
interface CardFooterProps {
  children: React.ReactNode
  className?: string
  divider?: boolean
}

export function CardFooter({
  children,
  className = '',
  divider = true,
}: CardFooterProps) {
  return (
    <div
      className={`mt-4 pt-4 ${divider ? 'border-t border-border' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Card badge component for status/tags
 */
interface CardBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export function CardBadge({
  children,
  variant = 'primary',
  className = '',
}: CardBadgeProps) {
  const variantClass = {
    primary: 'bg-accent/10 text-accent border-accent/30',
    success: 'bg-accent/10 text-accent border-accent/30',
    warning: 'bg-amber/10 text-amber border-amber/30',
    error: 'bg-red/10 text-red border-red/30',
    info: 'bg-blue/10 text-blue border-blue/30',
  }[variant]

  return (
    <span
      className={`inline-flex items-center px-2.5 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full border ${variantClass} ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * Card stat component for displaying KPIs
 */
interface CardStatProps {
  label: string
  value: string | number
  change?: { value: number; positive: boolean }
  icon?: React.ReactNode
}

export function CardStat({ label, value, change, icon }: CardStatProps) {
  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs md:text-sm text-muted mb-1">
            {label}
          </p>
          <p className="text-xl md:text-2xl font-display text-text">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0 text-accent opacity-70">
            {icon}
          </div>
        )}
      </div>
      {change && (
        <p className={`text-xs md:text-sm font-medium ${
          change.positive ? 'text-accent' : 'text-red'
        }`}>
          {change.positive ? '+' : '-'}{Math.abs(change.value)}%
        </p>
      )}
    </div>
  )
}
