import { PostgrestError } from '@supabase/supabase-js'

/**
 * Custom error class for Supabase-related errors
 */
export class FinsightSupabaseError extends Error {
  constructor(
    public code: string,
    public message: string,
    public originalError?: Error | PostgrestError
  ) {
    super(message)
    this.name = 'FinsightSupabaseError'
  }
}

/**
 * Map of Supabase error codes to user-friendly messages
 */
const errorCodeMap: Record<string, string> = {
  // Authentication errors
  'invalid_credentials': 'Invalid email or password. Please try again.',
  'user_already_exists': 'This email is already registered. Please log in or use a different email.',
  'weak_password': 'Password is too weak. Please use a stronger password.',
  'invalid_email': 'Invalid email address. Please check and try again.',
  'email_not_confirmed': 'Please confirm your email before logging in.',
  'email_address_invalid': 'Email address is invalid.',
  'over_email_send_rate_limit': 'Too many email requests. Please try again later.',
  'auth_sign_up_provider_disabled': 'This sign-up method is not enabled. Please contact support.',
  'auth_invalid_token': 'Invalid authentication token. Please log in again.',
  'session_not_found': 'Session not found. Please log in again.',

  // Database errors (PostgreSQL/Postgrest)
  'PGRST116': 'You do not have permission to access this resource.',
  'PGRST102': 'The requested resource was not found.',
  'PGRST204': 'No data returned.',
  '23505': 'This record already exists. Duplicate entry detected.',
  '23503': 'Cannot delete this record due to related data.',
  '42P01': 'The table does not exist.',
  '42701': 'A column with this name already exists.',
  '23514': 'The value violates a check constraint.',
  'PGRST400': 'Bad request. Invalid data provided.',
  'PGRST401': 'You must be logged in to perform this action.',
  'PGRST403': 'Permission denied.',

  // Network errors
  'network_error': 'Network error. Please check your connection and try again.',
  'timeout': 'Request took too long. Please try again.',
  'service_unavailable': 'Service is temporarily unavailable. Please try again later.',

  // General errors
  'unknown': 'An unknown error occurred. Please try again.',
}

/**
 * Get a user-friendly error message from an error code
 * @param code - Error code
 * @returns User-friendly error message
 */
export function getErrorMessage(code: string): string {
  return errorCodeMap[code] || `An error occurred: ${code}`
}

/**
 * Check if an error is a PostgreSQL/Postgrest error
 * @param error - The error to check
 * @returns true if error is a PostgrestError, false otherwise
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    error instanceof Error &&
    'code' in error &&
    'message' in error &&
    typeof (error as PostgrestError).code === 'string'
  )
}

/**
 * Check if an error is an auth error
 * @param error - The error to check
 * @returns true if error is auth-related, false otherwise
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error && 'status' in error && 'error_code' in error) {
    const authError = error as any
    return authError.status === 400 || authError.status === 401 || authError.status === 422
  }
  return false
}

/**
 * Check if an error is a database/query error
 * @param error - The error to check
 * @returns true if error is database-related, false otherwise
 */
export function isDatabaseError(error: unknown): boolean {
  return isPostgrestError(error)
}

/**
 * Check if an error is a network error
 * @param error - The error to check
 * @returns true if error is network-related, false otherwise
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout')
    )
  }
  return false
}

/**
 * Check if an error is a permission error
 * @param error - The error to check
 * @returns true if error is permission-related, false otherwise
 */
export function isPermissionError(error: unknown): boolean {
  if (isPostgrestError(error)) {
    return error.code === 'PGRST116' || error.code === 'PGRST403'
  }
  return false
}

/**
 * Handle Supabase errors and return a standardized error object
 * @param error - The error to handle
 * @returns FinsightSupabaseError with code and user-friendly message
 */
export function handleSupabaseError(error: unknown): FinsightSupabaseError {
  if (isPostgrestError(error)) {
    const userMessage = getErrorMessage(error.code)
    console.error(`Supabase Error [${error.code}]:`, error.message)
    return new FinsightSupabaseError(error.code, userMessage, error)
  }

  if (error instanceof Error) {
    // Handle Supabase auth errors
    if ('status' in error && 'error_code' in error) {
      const authError = error as any
      const userMessage = getErrorMessage(authError.error_code || 'unknown')
      console.error(`Supabase Auth Error [${authError.error_code}]:`, error.message)
      return new FinsightSupabaseError(authError.error_code || 'unknown', userMessage, error)
    }

    // Handle other errors
    const code = (error as any).code || 'unknown'
    const userMessage = getErrorMessage(code)
    console.error(`Supabase Error [${code}]:`, error.message)
    return new FinsightSupabaseError(code, userMessage, error)
  }

  console.error('Unknown Error:', error)
  return new FinsightSupabaseError(
    'unknown',
    'An unexpected error occurred. Please try again.'
  )
}

/**
 * Log Supabase error with context for debugging
 * @param context - Context describing where the error occurred
 * @param error - The error to log
 */
export function logSupabaseError(context: string, error: unknown): void {
  const sbError = handleSupabaseError(error)
  console.error(`[${context}] Supabase Error [${sbError.code}]:`, sbError.message)
  if (sbError.originalError) {
    console.error(`[${context}] Original error:`, sbError.originalError)
  }
}

/**
 * Determine if an error is retryable
 * @param error - The error to check
 * @returns true if operation should be retried, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  if (isPostgrestError(error)) {
    const retryableCodes = ['500', '502', '503', '504', 'timeout', 'PGRST500']
    return retryableCodes.includes(error.code)
  }

  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('Network') ||
      error.message.includes('temporarily unavailable')
    )
  }

  return false
}

/**
 * Create a user-friendly error response for API routes or UI
 * @param error - The error to format
 * @param isDevelopment - Whether to include technical details (default: false)
 * @returns Error response object
 */
export function formatErrorResponse(
  error: unknown,
  isDevelopment: boolean = false
): {
  success: false
  error: string
  code?: string
  details?: string
} {
  const sbError = handleSupabaseError(error)

  const response: {
    success: false
    error: string
    code?: string
    details?: string
  } = {
    success: false,
    error: sbError.message,
    code: sbError.code,
  }

  if (isDevelopment && sbError.originalError) {
    if (isPostgrestError(sbError.originalError)) {
      response.details = sbError.originalError.message
    } else if (sbError.originalError instanceof Error) {
      response.details = sbError.originalError.message
    }
  }

  return response
}
