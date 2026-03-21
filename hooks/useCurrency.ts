'use client'

import { formatCurrency } from '@/lib/utils'

export function useCurrency() {
  return {
    format: formatCurrency,
  }
}
