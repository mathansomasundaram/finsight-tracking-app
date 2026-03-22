import { supabase } from '@/lib/supabase'
import { User } from '@/types/index'
import { handleSupabaseError } from '@/lib/supabaseErrors'

function getAppOrigin(): string {
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : null
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || null
  const fallbackOrigin = configuredOrigin || browserOrigin || 'http://localhost:3000'

  if (configuredOrigin) {
    return configuredOrigin
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  return fallbackOrigin
}

/**
 * Maps Supabase Auth User to User interface
 */
function mapSupabaseUserToUser(supabaseUser: any, profile?: any): User {
  const displayName = profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
  return {
    id: supabaseUser.id,
    name: displayName,
    email: supabaseUser.email || '',
    baseCurrency: profile?.base_currency || 'INR',
    createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
    avatarInitials: displayName
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
  }
}

/**
 * Handles Supabase auth errors and returns user-friendly messages
 */
function getErrorMessage(error: unknown): string {
  const sbError = handleSupabaseError(error)
  return sbError.message
}

async function ensureUserProfile(supabaseUser: any): Promise<User> {
  const fallbackName = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User'
  const fallbackInitials = fallbackName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const { data: existingProfile, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', supabaseUser.id)
    .maybeSingle()

  if (fetchError) {
    throw fetchError
  }

  if (existingProfile) {
    if (existingProfile.is_disabled) {
      await supabase.auth.signOut()
      throw new Error('This account has been disabled. Please contact support if you need it reactivated.')
    }

    return mapSupabaseUserToUser(supabaseUser, existingProfile)
  }

  const { data: createdProfile, error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: fallbackName,
        base_currency: 'INR',
        avatar_initials: fallbackInitials,
      },
      {
        onConflict: 'id',
      }
    )
    .select()
    .single()

  if (upsertError) {
    throw upsertError
  }

  return mapSupabaseUserToUser(supabaseUser, createdProfile)
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<User> {
  try {
    // Create Supabase Auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (signUpError) throw signUpError
    if (!authData.user) throw new Error('Failed to create user')

    return await ensureUserProfile(authData.user)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) throw signInError
    if (!authData.user) throw new Error('Failed to sign in')

    return await ensureUserProfile(authData.user)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const redirectTo = `${getAppOrigin()}/auth/callback`
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (signInError) throw signInError

    // Note: For OAuth, the actual sign-in happens after redirect callback
    // This function initiates the OAuth flow
    return {
      id: '',
      name: '',
      email: '',
      baseCurrency: 'INR',
      createdAt: new Date(),
      avatarInitials: '',
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGithub(): Promise<User> {
  try {
    const redirectTo = `${getAppOrigin()}/auth/callback`
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo,
      },
    })

    if (signInError) throw signInError

    // Note: For OAuth, the actual sign-in happens after redirect callback
    return {
      id: '',
      name: '',
      email: '',
      baseCurrency: 'INR',
      createdAt: new Date(),
      avatarInitials: '',
    }
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign out the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user) return null

    return await ensureUserProfile(sessionData.session.user)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const authSubscription = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      void Promise.resolve()
        .then(() => ensureUserProfile(session.user))
        .then((resolvedUser) => callback(resolvedUser))
        .catch((error) => {
          console.error('Error in onAuthStateChange:', error)
          callback(null)
        })
    } else {
      callback(null)
    }
  })

  // Return unsubscribe function
  return () => {
    authSubscription.data.subscription.unsubscribe()
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session?.user || sessionData.session.user.id !== userId) {
      throw new Error('Not authenticated or user ID mismatch')
    }

    // Update auth profile if name changed
    if (updates.name) {
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
        },
      })

      if (updateAuthError) throw updateAuthError
    }

    // Update database user record
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.baseCurrency) updateData.base_currency = updates.baseCurrency
    if (updates.avatarInitials) updateData.avatar_initials = updates.avatarInitials

    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    const { data: currentSession } = await supabase.auth.getSession()
    if (!currentSession.session?.user) throw new Error('Session lost')

    return mapSupabaseUserToUser(currentSession.session.user, updatedProfile)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Verify email (for magic link auth)
 */
export async function verifyEmail(token: string, type: string): Promise<void> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const redirectTo = `${getAppOrigin()}/auth/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function deleteCurrentUserData(): Promise<void> {
  try {
    const { error } = await supabase.rpc('delete_current_user_data')
    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function disableCurrentUser(reason: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('deactivate_current_user', {
      p_reason: reason,
    })
    if (error) throw error
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function reauthenticateCurrentUser(password: string): Promise<void> {
  try {
    const { data: authUserData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const authUser = authUserData.user
    if (!authUser?.email) {
      throw new Error('Unable to verify the current user session')
    }

    const provider = authUser.app_metadata?.provider
    if (provider && provider !== 'email') {
      throw new Error('Please sign in again with your provider before performing this action')
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.email,
      password,
    })

    if (signInError) throw signInError
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

export async function getCurrentAuthProvider(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user?.app_metadata?.provider || null
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}
