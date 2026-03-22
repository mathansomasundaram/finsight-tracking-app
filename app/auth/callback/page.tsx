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

      console.log('[AuthDebug] callback:start', {
        href: window.location.href,
        origin: window.location.origin,
        hasCode: Boolean(code),
        errorDescription,
      })

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

        const { data: sessionData } = await supabase.auth.getSession()
        console.log('[AuthDebug] callback:session', {
          hasSession: Boolean(sessionData.session),
          userId: sessionData.session?.user?.id || null,
          userEmail: sessionData.session?.user?.email || null,
        })

        if (!sessionData.session?.user) {
          throw new Error('Failed to establish authenticated session')
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
