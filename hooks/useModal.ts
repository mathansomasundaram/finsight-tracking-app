'use client'

import { useState, useCallback } from 'react'

interface UseModalOptions {
  initialOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function useModal(options?: UseModalOptions) {
  const [isOpen, setIsOpen] = useState(options?.initialOpen ?? false)

  const open = useCallback(() => {
    setIsOpen(true)
    options?.onOpenChange?.(true)
  }, [options])

  const close = useCallback(() => {
    setIsOpen(false)
    options?.onOpenChange?.(false)
  }, [options])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev
      options?.onOpenChange?.(newState)
      return newState
    })
  }, [options])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}
