'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { THEME_COLORS, Theme } from './themeTokens'

interface ThemeContextType {
  theme: Theme
  colors: typeof THEME_COLORS.dark
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem('finsight-theme') as Theme | null
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme)
    }
  }, [])

  React.useEffect(() => {
    window.localStorage.setItem('finsight-theme', theme)
  }, [theme])

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const colors = THEME_COLORS[theme]

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return dark theme as default if no provider
    return {
      theme: 'dark',
      colors: THEME_COLORS.dark,
      setTheme: () => {},
      toggleTheme: () => {},
    }
  }
  return context
}

/**
 * Get color from current theme
 */
export function getThemeColor(
  colorKey: keyof typeof THEME_COLORS.dark,
  theme: Theme = 'dark'
): string {
  return THEME_COLORS[theme][colorKey]
}
