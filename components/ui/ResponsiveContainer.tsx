'use client'

import React, { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

/**
 * Responsive container component that adjusts padding based on screen size.
 * Mobile: 16px (p-4)
 * Tablet: 24px (p-6)
 * Desktop: 28px (p-7)
 */
export function ResponsiveContainer({
  children,
  className = '',
  padded = true,
}: ResponsiveContainerProps) {
  const paddingClass = padded ? 'p-4 md:p-6 lg:p-7' : ''

  return (
    <div className={`${paddingClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive grid container for cards
 */
interface ResponsiveGridProps {
  children: ReactNode
  columns?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = 'auto',
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClass = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8',
  }[gap]

  const colClass = {
    auto: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columns]

  return (
    <div className={`grid ${colClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive flex container that stacks on mobile
 */
interface ResponsiveFlexProps {
  children: ReactNode
  direction?: 'row' | 'col'
  gap?: 'sm' | 'md' | 'lg'
  wrap?: boolean
  className?: string
}

export function ResponsiveFlex({
  children,
  direction = 'row',
  gap = 'md',
  wrap = true,
  className = '',
}: ResponsiveFlexProps) {
  const gapClass = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4',
    lg: 'gap-4 md:gap-6',
  }[gap]

  const dirClass = direction === 'col' ? 'flex-col' : 'flex-row'
  const wrapClass = wrap ? 'flex-wrap' : ''

  return (
    <div className={`flex ${dirClass} ${wrapClass} ${gapClass} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive table wrapper that scrolls on mobile
 */
interface ResponsiveTableProps {
  children: ReactNode
  className?: string
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-x-auto -mx-4 md:mx-0 md:rounded-lg md:border md:border-border ${className}`}>
      <div className="inline-block w-full md:w-auto">
        {children}
      </div>
    </div>
  )
}

/**
 * Responsive heading that adjusts size based on screen size
 */
interface ResponsiveHeadingProps {
  level?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

export function ResponsiveHeading({
  level = 1,
  children,
  className = '',
}: ResponsiveHeadingProps) {
  const sizeClass = {
    1: 'text-2xl md:text-3xl lg:text-4xl',
    2: 'text-xl md:text-2xl lg:text-3xl',
    3: 'text-lg md:text-xl lg:text-2xl',
    4: 'text-base md:text-lg lg:text-xl',
  }[level]

  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const Component = React.createElement(
    Tag,
    {
      className: `font-display text-text ${sizeClass} ${className}`,
    },
    children
  )

  return Component
}

/**
 * Responsive text that adjusts size based on screen size
 */
interface ResponsiveTextProps {
  children: ReactNode
  size?: 'sm' | 'base' | 'lg' | 'xl'
  muted?: boolean
  className?: string
}

export function ResponsiveText({
  children,
  size = 'base',
  muted = false,
  className = '',
}: ResponsiveTextProps) {
  const sizeClass = {
    sm: 'text-xs md:text-sm lg:text-base',
    base: 'text-sm md:text-base lg:text-base',
    lg: 'text-base md:text-lg lg:text-lg',
    xl: 'text-lg md:text-xl lg:text-xl',
  }[size]

  const colorClass = muted ? 'text-muted' : 'text-text'

  return (
    <p className={`${sizeClass} ${colorClass} ${className}`}>
      {children}
    </p>
  )
}
