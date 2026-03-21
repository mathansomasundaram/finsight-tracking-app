'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Completing sign in...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function completeAuth() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        if (!isActive) return
        setError(errorDescription)
        setMessage('Authentication failed.')
        return
      }

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }

        // Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw userError || new Error('Failed to get user')

        // Create user profile in database if it doesn't exist
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (checkError?.code === 'PGRST116') {
          // User doesn't exist, create profile
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              base_currency: 'INR',
              avatar_initials: (user.user_metadata?.name || user.email?.split('@')[0] || 'U')
                .split(' ')
                .map((part: string) => part[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
            })

          if (insertError) {
            console.error('Failed to create user profile:', insertError)
            throw insertError
          }
        } else if (checkError && checkError.code !== 'PGRST116') {
          // Different error, log and throw
          console.error('Error checking user:', checkError)
          throw checkError
        }

        if (!isActive) return
        setMessage('Sign in successful. Redirecting...')
        router.replace('/')
      } catch (err) {
        if (!isActive) return
        const errorMessage = err instanceof Error ? err.message : 'Unable to complete sign in.'
        setError(errorMessage)
        setMessage('Authentication failed.')
      }
    }

    completeAuth()

    return () => {
      isActive = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg2 border border-border rounded-2xl p-8 text-center">
        <div className="font-display text-2xl text-text mb-3">Auth Callback</div>
        <p className="text-muted mb-6">{message}</p>
        {error ? <p className="text-red text-13 mb-6">{error}</p> : null}
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
