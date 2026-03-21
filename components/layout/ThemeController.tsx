'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Moon, Palette, Sun } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { Theme } from '@/lib/themeTokens'

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
]

export function ThemeController() {
  const { theme, colors, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
      body.style.setProperty(`--${key}`, value)
    })

    root.dataset.theme = theme
    body.dataset.theme = theme
    body.classList.toggle('dark', theme === 'dark')
    body.classList.toggle('light', theme === 'light')
  }, [colors, theme])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="absolute bottom-16 right-0 w-72 rounded-2xl border border-border bg-bg2 shadow-2xl shadow-black/20 overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text">Choose Theme</p>
            <p className="text-xs text-muted mt-1">Apply a look across the full interface.</p>
          </div>
          <div className="p-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = option.id === theme

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTheme(option.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/15 text-text'
                      : 'text-text hover:bg-bg3'
                  }`}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${option.label.toLowerCase()} theme`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-accent text-black' : 'bg-bg3 text-text'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {option.label}
                  </span>
                  {isActive ? <Check className="w-4 h-4 text-accent" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full border border-border bg-bg2/95 backdrop-blur-xl shadow-2xl shadow-black/15 flex items-center justify-center text-text hover:bg-bg3 transition-colors"
        aria-label="Open theme settings"
      >
        <Palette className="w-5 h-5" />
      </button>
    </div>
  )
}
