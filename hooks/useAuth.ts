'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@/types/index'
import {
  signUpWithEmail,
  loginWithEmail,
  signInWithGoogle,
  signInWithGithub,
  logoutUser,
  onAuthStateChange,
  updateUserProfile,
  getCurrentUser,
} from '@/lib/auth/authService'
import { setSession, clearSession } from '@/lib/auth/session'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  error: string | null
  signUp: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

/**
 * Custom hook for authentication with Supabase
 * Manages user state and provides auth methods
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true

    const hydrateUser = async () => {
      try {
        const liveUser = await getCurrentUser()
        if (!isMounted) return

        if (liveUser) {
          setUser(liveUser)
          setSession(liveUser)
          setError(null)
        } else {
          setUser(null)
          clearSession()
        }
      } catch (err) {
        if (!isMounted) return
        console.error('Error hydrating auth session:', err)
        setUser(null)
        clearSession()
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    hydrateUser()

    // Subscribe to auth state changes from Supabase
    const unsubscribe = onAuthStateChange((authUser) => {
      if (!isMounted) return

      if (authUser) {
        setUser(authUser)
        setSession(authUser)
        setError(null)
      } else {
        setUser(null)
        clearSession()
      }
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const newUser = await signUpWithEmail(email, password, name)
      setUser(newUser)
      setSession(newUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)
      const authUser = await loginWithEmail(email, password)
      setUser(authUser)
      setSession(authUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogleFn = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      await signInWithGoogle()
      // Note: After OAuth redirect, auth state will be updated automatically
      // via the onAuthStateChange listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign in failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGithubFn = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      await signInWithGithub()
      // Note: After OAuth redirect, auth state will be updated automatically
      // via the onAuthStateChange listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GitHub sign in failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)
      await logoutUser()
      setUser(null)
      clearSession()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) {
        throw new Error('No user authenticated')
      }

      try {
        setError(null)
        setIsLoading(true)
        const updatedUser = await updateUserProfile(user.id, updates)
        setUser(updatedUser)
        setSession(updatedUser)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  return {
    user,
    isLoading,
    error,
    signUp,
    login,
    loginWithGoogle: loginWithGoogleFn,
    loginWithGithub: loginWithGithubFn,
    logout,
    updateProfile,
  }
}
