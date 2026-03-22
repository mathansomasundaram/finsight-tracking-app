import { supabase } from '@/lib/supabase'
import { User } from '@/types/index'
import { handleSupabaseError } from '@/lib/supabaseErrors'

function getAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
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

    // Create user profile in database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        base_currency: 'INR',
        avatar_initials: name
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Continue anyway, profile can be created on first login
    }

    const userData = mapSupabaseUserToUser(authData.user, profile)
    return userData
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

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // If profile doesn't exist, create one
      const { data: newProfile } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          base_currency: 'INR',
        })
        .select()
        .single()

      return mapSupabaseUserToUser(authData.user, newProfile)
    }

    return mapSupabaseUserToUser(authData.user, profile)
  } catch (error) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const { data: authData, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getAppOrigin()}/auth/callback`,
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
    const { data: authData, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${getAppOrigin()}/auth/callback`,
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

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single()

    return mapSupabaseUserToUser(sessionData.session.user, profile)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Check if profile doesn't exist (PGRST116 is the "not found" error)
        if (profileError?.code === 'PGRST116' || !profile) {
          // Create profile if it doesn't exist
          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              base_currency: 'INR',
              avatar_initials: (session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'U')
                .split(' ')
                .map((part: string) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            callback(null)
            return
          }

          callback(mapSupabaseUserToUser(session.user, newProfile))
        } else if (profileError) {
          // Different error occurred
          console.error('Error fetching user profile:', profileError)
          callback(null)
        } else {
          callback(mapSupabaseUserToUser(session.user, profile))
        }
      } catch (error) {
        console.error('Error in onAuthStateChange:', error)
        callback(null)
      }
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppOrigin()}/auth/reset-password`,
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
