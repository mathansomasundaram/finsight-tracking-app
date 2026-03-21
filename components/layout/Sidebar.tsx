'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Home,
  ArrowUpDown,
  TrendingUp,
  Clock,
  Target,
  User,
} from 'lucide-react'

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
    ],
  },
  {
    label: 'MONEY',
    items: [
      { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
      { name: 'Assets', href: '/assets', icon: TrendingUp },
      { name: 'Liabilities', href: '/liabilities', icon: Clock },
    ],
  },
  {
    label: 'PLANNING',
    items: [
      { name: 'Goals', href: '/goals', icon: Target },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { name: 'Profile', href: '/profile', icon: User },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const sidebarName = user?.name || 'User'
  const sidebarEmail = user?.email || 'No email'
  const sidebarInitials = user?.avatarInitials || 'U'

  return (
    <aside className="w-sidebar-w bg-bg2 border-r border-border flex flex-col flex-shrink-0 relative z-10">
      {/* Logo Section */}
      <div className="px-5 py-4 border-b border-border">
        <div className="font-display text-2xl leading-none text-text tracking-tight">
          Fin<span className="text-accent">sight</span>
        </div>
        <div className="text-9 text-muted tracking-widest uppercase mt-1">
          Personal Finance
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="text-8 tracking-wider uppercase text-muted2 px-2.5 py-2 mt-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm border border-transparent text-13.5 font-normal transition-all duration-150 ${
                    isActive
                      ? 'bg-opacity-10 bg-accent text-accent border-opacity-15 border-accent font-medium'
                      : 'text-muted hover:bg-bg3 hover:text-text'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0 opacity-70" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="px-2.5 py-3 border-t border-border">
        <Link href="/profile" className="flex items-center gap-2 px-2.5 py-2 rounded-sm hover:bg-bg3 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-teal flex items-center justify-center text-10 font-semibold text-black flex-shrink-0">
            {sidebarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-13 font-medium text-text truncate">
              {sidebarName}
            </div>
            <div className="text-10.5 text-muted truncate">
              {sidebarEmail}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
