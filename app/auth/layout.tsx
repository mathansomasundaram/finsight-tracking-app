import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finsight - Sign In / Sign Up',
  description: 'Authentication for Finsight Personal Finance Tracker',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
