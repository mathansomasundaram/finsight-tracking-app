'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface AccordionItem {
  id: string
  title: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
  itemClassName?: string
}

/**
 * Responsive accordion component ideal for mobile content organization
 * Features smooth open/close animations
 */
export function Accordion({
  items,
  allowMultiple = false,
  className = '',
  itemClassName = '',
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newExpandedIds = new Set(expandedIds)

    if (newExpandedIds.has(id)) {
      newExpandedIds.delete(id)
    } else {
      if (!allowMultiple) {
        newExpandedIds.clear()
      }
      newExpandedIds.add(id)
    }

    setExpandedIds(newExpandedIds)
  }

  return (
    <div className={`space-y-2 md:space-y-3 ${className}`}>
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id)

        return (
          <div
            key={item.id}
            className={`border border-border rounded-lg overflow-hidden transition-all ${
              isExpanded ? 'bg-bg3 bg-opacity-50' : 'bg-bg2'
            } ${itemClassName}`}
          >
            {/* Header */}
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={`w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-bg3 hover:bg-opacity-50 transition-colors ${
                item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-expanded={isExpanded}
              aria-controls={`content-${item.id}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-text text-left truncate">
                  {item.title}
                </span>
              </div>

              {/* Chevron icon */}
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 text-muted transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Content */}
            {isExpanded && (
              <div
                id={`content-${item.id}`}
                className="px-4 md:px-6 py-3 md:py-4 border-t border-border bg-bg2 text-sm md:text-base text-text animate-slide-down"
              >
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
