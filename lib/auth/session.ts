import { User } from '@/types/index'
import { supabase } from '@/lib/supabase'

const SESSION_KEY = 'finsight_user_session'

/**
 * Get session from localStorage (fallback from Supabase session)
 */
export function getSession(): User | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const session = localStorage.getItem(SESSION_KEY)
    return session ? JSON.parse(session) : null
  } catch (error) {
    console.error('Error reading session:', error)
    return null
  }
}

/**
 * Set session in localStorage
 * Note: Supabase Auth handles the actual auth session in its own storage
 * This is a cache for quick user info access
 */
export function setSession(user: User): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error setting session:', error)
  }
}

/**
 * Clear session from localStorage
 * Note: This doesn't clear the Supabase auth session, only the cached user info
 */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Error clearing session:', error)
  }
}

/**
 * Get the current Supabase session
 */
export async function getSupabaseSession() {
  try {
    const { data: session } = await supabase.auth.getSession()
    return session.session
  } catch (error) {
    console.error('Error getting Supabase session:', error)
    return null
  }
}

/**
 * Refresh Supabase session if needed
 */
export async function refreshSupabaseSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Error refreshing Supabase session:', error)
    return null
  }
}
