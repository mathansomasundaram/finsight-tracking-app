'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/auth/authService'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'success'>('checking')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function validateRecoverySession() {
      try {
        const { data } = await supabase.auth.getSession()
        console.log('[AuthDebug] reset-password:session-check', {
          href: window.location.href,
          origin: window.location.origin,
          hasSession: Boolean(data.session),
          userId: data.session?.user?.id || null,
        })
        if (!isActive) return
        setStatus(data.session ? 'ready' : 'invalid')
      } catch (err) {
        if (!isActive) return
        setStatus('invalid')
        setError(err instanceof Error ? err.message : 'This reset link is invalid.')
      }
    }

    validateRecoverySession()

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      await resetPassword(password)
      setStatus('success')
      setTimeout(() => {
        router.replace('/auth/login')
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg2 border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-text mb-2">
            Fin<span className="text-accent">sight</span>
          </div>
          <p className="text-muted text-13">Reset your password</p>
        </div>

        {status === 'checking' ? (
          <p className="text-muted text-center">Validating reset link...</p>
        ) : null}

        {status === 'invalid' ? (
          <div className="text-center space-y-4">
            <p className="text-red">{error || 'This reset link is invalid or expired.'}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
            >
              Back to Login
            </Link>
          </div>
        ) : null}

        {status === 'ready' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-13 font-medium text-text mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted transition-colors hover:border-border2 focus:outline-none focus:border-accent"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-13 font-medium text-text mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted transition-colors hover:border-border2 focus:outline-none focus:border-accent"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {error ? <p className="text-red text-12">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : null}

        {status === 'success' ? (
          <div className="text-center space-y-4">
            <p className="text-accent">Password updated successfully. Redirecting to login...</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium"
            >
              Continue
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
