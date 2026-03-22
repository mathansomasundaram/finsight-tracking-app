'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ThemeController } from './ThemeController'
import { useAuth } from '@/hooks/useAuth'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading } = useAuth()
  const isAuthPage = pathname?.startsWith('/auth')

  useEffect(() => {
    if (!isAuthPage && !isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isAuthPage, isLoading, router, user])

  if (isAuthPage) {
    return <div className="min-h-screen bg-bg">{children}</div>
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-3xl text-text mb-3">
            Fin<span className="text-accent">sight</span>
          </div>
          <p className="text-muted">
            {isLoading ? 'Restoring your session...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <ThemeController />
    </div>
  )
}
