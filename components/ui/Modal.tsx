'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
}

/**
 * Responsive modal component that adapts to mobile screens
 * On mobile: fullscreen with slide-up animation
 * On desktop: centered with configurable size
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    fullscreen: 'w-full h-full max-w-none',
  }[size]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center md:items-center p-4 md:p-0">
        <div
          className={`${sizeClass} w-full ${
            size === 'fullscreen'
              ? 'h-screen animate-slide-up'
              : 'max-h-[90vh] md:max-h-none animate-scale-in rounded-2xl'
          } bg-bg2 border border-border flex flex-col shadow-lg overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-border flex-shrink-0">
              {title && (
                <h2 className="text-lg md:text-xl font-semibold text-text">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto flex-shrink-0 p-2 text-muted hover:text-text transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Modal footer component for consistent button layout
 */
interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`border-t border-border px-4 md:px-6 py-3 md:py-4 bg-bg3 bg-opacity-50 flex gap-3 flex-col-reverse md:flex-row md:justify-end ${className}`}>
      {children}
    </div>
  )
}

/**
 * Sheet component - like modal but slides from side on desktop
 */
interface SheetProps extends Omit<ModalProps, 'size'> {
  side?: 'left' | 'right' | 'top' | 'bottom'
}

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdropClick = true,
  side = 'right',
}: SheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const slideDir = {
    left: 'left-0 animate-slide-in',
    right: 'right-0 -translate-x-full md:translate-x-0 md:animate-slide-in',
    top: 'top-0 -translate-y-full md:translate-y-0 md:animate-slide-down',
    bottom: 'bottom-0 translate-y-full md:translate-y-0 md:animate-slide-up',
  }[side]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-fade-in"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Sheet */}
      <div
        className={`fixed ${slideDir} z-50 h-full md:h-auto md:max-h-screen w-full md:w-96 bg-bg2 border border-border flex flex-col shadow-lg`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-border flex-shrink-0">
            {title && (
              <h2 className="text-lg md:text-xl font-semibold text-text">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 p-2 text-muted hover:text-text transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
          {children}
        </div>
      </div>
    </>
  )
}
