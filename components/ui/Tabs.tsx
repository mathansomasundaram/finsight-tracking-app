'use client'

import React, { useState } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  defaultActiveId?: string
  onChange?: (activeId: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

/**
 * Responsive tabs component that adapts to mobile and desktop
 * Features smooth transitions and keyboard support
 */
export function Tabs({
  items,
  defaultActiveId,
  onChange,
  className = '',
  variant = 'default',
}: TabsProps) {
  const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id)

  const handleTabChange = (id: string) => {
    setActiveId(id)
    onChange?.(id)
  }

  const activeTab = items.find((item) => item.id === activeId)

  const tabButtonClass = {
    default: 'px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium transition-all border-b-2',
    pills: 'px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-medium rounded-lg transition-all',
    underline: 'px-2 md:px-3 py-2 text-xs md:text-sm font-medium border-b-2 transition-all',
  }[variant]

  const tabListClass = {
    default: 'flex gap-1 border-b border-border overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0',
    pills: 'flex gap-2 md:gap-3 overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0 pb-2',
    underline: 'flex gap-3 md:gap-4 border-b border-border overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0',
  }[variant]

  return (
    <div className={className}>
      {/* Tab buttons */}
      <div
        role="tablist"
        className={tabListClass}
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls={`panel-${item.id}`}
            disabled={item.disabled}
            onClick={() => handleTabChange(item.id)}
            className={`${tabButtonClass} flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
              activeId === item.id
                ? variant === 'pills'
                  ? 'bg-accent/10 text-accent border-accent'
                  : 'text-accent border-accent'
                : 'text-muted border-transparent hover:text-text'
            } ${
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {item.icon && (
              <span className="flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4 md:mt-6 animate-fade-in">
        {activeTab && (
          <div
            id={`panel-${activeTab.id}`}
            role="tabpanel"
            tabIndex={0}
          >
            {activeTab.content}
          </div>
        )}
      </div>
    </div>
  )
}
