import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine classnames with Tailwind CSS merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency amount in INR format
 * Example: 1234567 -> "₹12,34,567"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0'

  const absAmount = Math.abs(amount)
  const isNegative = amount < 0

  // Indian number formatting with commas
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return `${isNegative ? '-' : ''}₹${formatted}`
}

/**
 * Format date to readable format
 * Example: new Date('2026-03-20') -> "20 Mar 2026"
 */
export function formatDate(date: Date): string {
  if (!date) return ''

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format date in short format
 * Example: new Date('2026-03-20') -> "20/03"
 */
export function formatDateShort(date: Date): string {
  if (!date) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${day}/${month}`
}

/**
 * Get month name from month number (1-12)
 * Example: 3 -> "March"
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (month < 1 || month > 12) return ''
  return months[month - 1]
}

/**
 * Get number of days in a specific month
 */
export function getDaysInMonth(month: number, year: number): number {
  if (month < 1 || month > 12) return 0
  return new Date(year, month, 0).getDate()
}

/**
 * Format percentage value
 * Example: 0.8 -> "80%", 80 -> "80%"
 */
export function formatPercentage(value: number): string {
  if (isNaN(value)) return '0%'

  // If value is between 0 and 1, assume it's decimal
  const percentage = value <= 1 ? value * 100 : value

  return `${Math.round(percentage)}%`
}

/**
 * Get a color based on percentage value for progress visualization
 * Green (high) -> Amber (medium) -> Red (low)
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 75) {
    return '#c8f060' // Green/Accent
  } else if (percentage >= 50) {
    return '#f5a623' // Amber
  } else if (percentage >= 25) {
    return '#ff9f43' // Orange
  } else {
    return '#ff6b6b' // Red
  }
}

/**
 * Generate a random UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create header row
  const headerRow = headers
    .map(header => `"${header}"`)
    .join(',')

  // Create data rows
  const dataRows = data.map(row =>
    headers
      .map(header => {
        const value = row[header]
        // Handle dates
        if (value instanceof Date) {
          return `"${formatDate(value)}"`
        }
        // Escape quotes in strings
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`
        }
        return `"${value}"`
      })
      .join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Trigger browser download of file content
 */
export function downloadFile(content: string, filename: string): void {
  try {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Calculate days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDay)
}

/**
 * Format duration from days to human readable format
 * Example: 365 -> "1 year", 30 -> "1 month"
 */
export function formatDuration(days: number): string {
  if (days < 0) return 'Past'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return months === 1 ? '1 month' : `${months} months`
  }

  const years = Math.floor(days / 365)
  return years === 1 ? '1 year' : `${years} years`
}
