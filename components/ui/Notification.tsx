'use client'

import React, { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'

export interface NotificationProps {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Individual notification component with animations and mobile-friendly layout
 */
export function Notification({
  id,
  title,
  message,
  type,
  action,
  onRemove,
}: NotificationProps & { onRemove: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        onRemove(id)
      }, 300)
    }, 5000)

    return () => clearTimeout(timer)
  }, [id, onRemove])

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      textColor: 'text-accent',
      iconColor: 'text-accent',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red/10',
      borderColor: 'border-red/30',
      textColor: 'text-red',
      iconColor: 'text-red',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-amber/10',
      borderColor: 'border-amber/30',
      textColor: 'text-amber',
      iconColor: 'text-amber',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue/10',
      borderColor: 'border-blue/30',
      textColor: 'text-blue',
      iconColor: 'text-blue',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={`${
        isExiting ? 'animate-fade-out' : 'animate-slide-up'
      } ${config.bgColor} border ${config.borderColor} rounded-lg p-4 md:p-5 backdrop-blur-sm pointer-events-auto max-w-sm w-full`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-text mb-1 truncate">
              {title}
            </h3>
          )}
          <p className="text-sm text-text break-words">
            {message}
          </p>

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium ${config.textColor} hover:underline transition-colors`}
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setIsExiting(true)
            setTimeout(() => {
              onRemove(id)
            }, 300)
          }}
          className="flex-shrink-0 text-muted hover:text-text transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Notification container that holds multiple notifications
 * Mobile-friendly positioning and layout
 */
interface NotificationContainerProps {
  notifications: NotificationProps[]
  onRemove: (id: string) => void
}

export function NotificationContainer({
  notifications,
  onRemove,
}: NotificationContainerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 p-4 md:p-6 flex flex-col gap-2">
      {/* Mobile: center bottom, Desktop: top right */}
      <div className="ml-auto flex flex-col gap-3 items-end max-w-full md:max-w-sm">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    options?: { title?: string; action?: { label: string; onClick: () => void } }
  ) => {
    const id = Date.now().toString()
    const notification: NotificationProps = {
      id,
      message,
      type,
      ...options,
    }

    setNotifications((prev) => [...prev, notification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const success = (
    message: string,
    options?: { title?: string; action?: { label: string; onClick: () => void } }
  ) => addNotification(message, 'success', options)

  const error = (
    message: string,
    options?: { title?: string; action?: { label: string; onClick: () => void } }
  ) => addNotification(message, 'error', options)

  const warning = (
    message: string,
    options?: { title?: string; action?: { label: string; onClick: () => void } }
  ) => addNotification(message, 'warning', options)

  const info = (
    message: string,
    options?: { title?: string; action?: { label: string; onClick: () => void } }
  ) => addNotification(message, 'info', options)

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  }
}
