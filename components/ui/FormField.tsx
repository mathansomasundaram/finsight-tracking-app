'use client'

import React, { InputHTMLAttributes } from 'react'
import { Check, AlertCircle } from 'lucide-react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  isValid?: boolean
  required?: boolean
  helperText?: string
}

/**
 * Form field component with validation feedback.
 * Shows error styling, success checkmarks, and required indicators.
 */
export function FormField({
  label,
  error,
  isValid,
  required,
  helperText,
  className = '',
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text flex items-center gap-1">
          {label}
          {required && <span className="text-red">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          required={required}
          className={`w-full px-4 py-2.5 bg-bg3 border rounded-lg text-text placeholder-muted2 transition-all duration-150 outline-none ${
            error
              ? 'border-red/50 focus:border-red focus:ring-1 focus:ring-red/30'
              : isValid
                ? 'border-accent/50 focus:border-accent focus:ring-1 focus:ring-accent/30'
                : 'border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20'
          } ${className}`}
        />

        {/* Success Icon */}
        {isValid && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="w-5 h-5 text-accent" />
          </div>
        )}

        {/* Error Icon */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-red" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}

/**
 * Text area component with validation feedback
 */
interface FormTextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  isValid?: boolean
  required?: boolean
  helperText?: string
  rows?: number
}

export function FormTextArea({
  label,
  error,
  isValid,
  required,
  helperText,
  rows = 4,
  className = '',
  ...props
}: FormTextAreaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text flex items-center gap-1">
          {label}
          {required && <span className="text-red">*</span>}
        </label>
      )}

      <textarea
        {...(props as any)}
        required={required}
        rows={rows}
        className={`w-full px-4 py-2.5 bg-bg3 border rounded-lg text-text placeholder-muted2 transition-all duration-150 outline-none resize-none ${
          error
            ? 'border-red/50 focus:border-red focus:ring-1 focus:ring-red/30'
            : isValid
              ? 'border-accent/50 focus:border-accent focus:ring-1 focus:ring-accent/30'
              : 'border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20'
        } ${className}`}
      />

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}

/**
 * Select dropdown component with validation feedback
 */
interface FormSelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'type'> {
  label?: string
  error?: string
  isValid?: boolean
  required?: boolean
  helperText?: string
  options: Array<{ label: string; value: string }>
  placeholder?: string
}

export function FormSelect({
  label,
  error,
  isValid,
  required,
  helperText,
  options,
  placeholder,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text flex items-center gap-1">
          {label}
          {required && <span className="text-red">*</span>}
        </label>
      )}

      <select
        {...(props as any)}
        required={required}
        className={`w-full px-4 py-2.5 bg-bg3 border rounded-lg text-text transition-all duration-150 outline-none ${
          error
            ? 'border-red/50 focus:border-red focus:ring-1 focus:ring-red/30'
            : isValid
              ? 'border-accent/50 focus:border-accent focus:ring-1 focus:ring-accent/30'
              : 'border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/20'
        } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red flex items-center gap-1">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
