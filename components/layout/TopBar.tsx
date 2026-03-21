'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Inbox } from 'lucide-react'

const pageNames: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/assets': 'Assets',
  '/liabilities': 'Liabilities',
  '/goals': 'Goals',
  '/profile': 'Profile',
  '/auth/login': 'Login',
  '/auth/signup': 'Sign Up',
}

export function TopBar() {
  const pathname = usePathname()
  const title = pageNames[pathname] || 'Dashboard'
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div className="h-nav-h border-b border-border flex items-center px-7 gap-4 bg-bg flex-shrink-0">
      <h1 className="font-display text-5 text-text flex-1">
        {title}
      </h1>
      <div ref={containerRef} className="flex items-center gap-3 relative">
        <button
          type="button"
          onClick={() => setIsNotificationsOpen((prev) => !prev)}
          className="relative w-10 h-10 rounded-xl border border-border bg-bg2 hover:bg-bg3 text-text flex items-center justify-center transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {isNotificationsOpen ? (
          <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-border bg-bg2 shadow-2xl shadow-black/20 overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-text">Notifications</h2>
                <p className="text-xs text-muted">You are all caught up.</p>
              </div>
            </div>
            <div className="px-4 py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-bg3 flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 text-muted" />
              </div>
              <p className="text-sm font-medium text-text">No notifications</p>
              <p className="text-xs text-muted mt-1 max-w-[14rem] leading-5">
                Important product or account updates will appear here.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
