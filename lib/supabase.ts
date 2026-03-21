import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase configuration initialized from environment variables.
 * These are public keys and safe to expose in client-side code.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key'

// Check if valid credentials are provided
export function hasValidSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') &&
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!.length > 10
  )
}

/**
 * Supabase client instance (singleton pattern)
 * @remarks Use this for all Supabase operations (Auth, Database, Real-time)
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Get the Supabase client instance
 * @returns The initialized Supabase client
 */
export function getSupabaseClient(): SupabaseClient {
  return supabase
}

/**
 * Check if Supabase is properly initialized with all required credentials
 * @returns true if all required environment variables are set, false otherwise
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export default supabase
