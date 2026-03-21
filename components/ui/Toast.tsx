'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ToastProps {
  messages: ToastMessage[]
  onRemove: (id: string) => void
}

export function Toast({ messages, onRemove }: ToastProps) {
  return (
    <div className="fixed top-7 right-7 z-50 flex flex-col gap-3 pointer-events-none">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm pointer-events-auto ${
            msg.type === 'success'
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-red/10 border-red/30 text-red'
          }`}
        >
          <span className="text-13">{msg.message}</span>
          <button
            onClick={() => onRemove(msg.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString()
    setMessages((prev) => [...prev, { id, message, type }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id)
    }, 3000)
  }

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  return { messages, addToast, removeToast }
}
