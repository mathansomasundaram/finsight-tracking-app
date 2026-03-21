'use client'

import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
}

/**
 * Button component with multiple variants and sizes.
 * Features smooth hover effects and animations.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded-lg border transition-all duration-150 active:scale-95 focus:outline-none focus:ring-1'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantStyles = {
    primary:
      'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-accent/10 focus:ring-accent/30',
    secondary:
      'bg-bg3 text-text border-border hover:bg-bg4 hover:shadow-lg hover:shadow-white/5 focus:ring-accent/20',
    outline:
      'bg-transparent text-text border-border hover:bg-bg3 hover:border-accent/50 focus:ring-accent/20',
    destructive:
      'bg-red/10 text-red border-red/30 hover:bg-red/20 hover:shadow-lg hover:shadow-red/10 focus:ring-red/30',
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyle}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Icon button component - compact button for icons
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function IconButton({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: 'p-1.5 w-8 h-8',
    md: 'p-2 w-10 h-10',
    lg: 'p-2.5 w-12 h-12',
  }

  const variantStyles = {
    primary: 'text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30',
    secondary: 'text-text bg-bg3 hover:bg-bg4 border border-border',
    outline: 'text-text bg-transparent hover:bg-bg3 border border-border',
  }

  return (
    <button
      {...props}
      className={`
        flex items-center justify-center rounded-lg border transition-all duration-150
        active:scale-95 hover:shadow-lg focus:outline-none focus:ring-1
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
