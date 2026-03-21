'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Chrome } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { messages, addToast, removeToast } = useToast()
  const { user, isLoading: authLoading, login, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      addToast('Sign in successful! Redirecting...', 'success')

      // Redirect after successful login
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please try again.'
      addToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      addToast('Google sign in successful! Redirecting...', 'success')

      // Redirect after successful login
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed. Please try again.'
      addToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display text-3xl text-text mb-2">
            Fin<span className="text-accent">sight</span>
          </div>
          <p className="text-muted text-13">Personal Finance Tracker</p>
        </div>

        {/* Card */}
        <div className="bg-bg2 border border-border rounded-2xl p-8">
          {/* Heading */}
          <h1 className="font-display text-2xl text-text mb-2">
            Welcome Back
          </h1>
          <p className="text-muted text-13 mb-8">
            Sign in to your account
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-13 font-medium text-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg bg-bg3 border text-text placeholder-muted transition-colors focus:outline-none ${
                    errors.email
                      ? 'border-red focus:border-red'
                      : 'border-border hover:border-border2 focus:border-accent'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red text-12 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-13 font-medium text-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: '' })
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-2.5 rounded-lg bg-bg3 border text-text placeholder-muted transition-colors focus:outline-none ${
                    errors.password
                      ? 'border-red focus:border-red'
                      : 'border-border hover:border-border2 focus:border-accent'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-red text-12 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium text-13 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-muted text-12">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg3 hover:bg-bg4 text-text transition-colors font-medium text-13 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-4 h-4" />
            Sign In with Google
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-muted text-13 mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-accent hover:text-accent2 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Toast */}
      <Toast messages={messages} onRemove={removeToast} />
    </div>
  )
}
