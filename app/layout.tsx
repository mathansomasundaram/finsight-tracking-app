import type { Metadata } from 'next'
import './globals.css'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'
import { ThemeProvider } from '@/lib/ThemeContext'
import { THEME_COLORS } from '@/lib/themeTokens'

export const metadata: Metadata = {
  title: 'Finsight - Personal Finance Tracker',
  description: 'Track your finances with Finsight',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const defaultColors = THEME_COLORS.dark

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dark" style={{
        '--bg': defaultColors.bg,
        '--bg2': defaultColors.bg2,
        '--bg3': defaultColors.bg3,
        '--bg4': defaultColors.bg4,
        '--contrast': defaultColors.contrast,
        '--border': defaultColors.border,
        '--border2': defaultColors.border2,
        '--text': defaultColors.text,
        '--muted': defaultColors.muted,
        '--muted2': defaultColors.muted2,
        '--accent': defaultColors.accent,
        '--accent2': defaultColors.accent2,
        '--red': defaultColors.red,
        '--amber': defaultColors.amber,
        '--blue': defaultColors.blue,
        '--teal': defaultColors.teal,
        '--purple': defaultColors.purple,
      } as React.CSSProperties}>
        <ThemeProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
