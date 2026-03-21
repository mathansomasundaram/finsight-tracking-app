'use client'

import React, { useMemo } from 'react'
import { getCategoryColor, formatChartAxis } from '@/lib/chartUtils'
import { cn } from '@/lib/utils'

export interface BarChartData {
  name: string
  value: number
  emoji?: string
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  className?: string
  height?: number
  showGrid?: boolean
  showValues?: boolean
  horizontal?: boolean
}

export function BarChart({
  data,
  title,
  className,
  height = 300,
  showGrid = true,
  showValues = true,
  horizontal = false,
}: BarChartProps) {
  const { maxValue, chartData } = useMemo(() => {
    const values = data.map((d) => d.value)
    const max = Math.max(...values)
    const padding = max * 0.1 || 10

    return {
      maxValue: max + padding,
      chartData: data,
    }
  }, [data])

  const yAxisLabels = useMemo(() => {
    const step = maxValue / 4
    return [0, step, step * 2, step * 3, maxValue]
  }, [maxValue])

  if (horizontal) {
    // Horizontal bar chart
    return (
      <div className={cn('w-full', className)}>
        {title && (
          <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
        )}

        <div className="space-y-4">
          {chartData.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.emoji && <span>{item.emoji}</span>}
                    <span className="text-muted">{item.name}</span>
                  </div>
                  {showValues && (
                    <span className="font-semibold text-text">
                      ₹{(item.value / 1000).toFixed(0)}K
                    </span>
                  )}
                </div>
                <div className="w-full bg-bg3 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getCategoryColor(index),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical bar chart
  const maxBarHeight = height - 60

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      )}

      <div className="relative w-full bg-bg2 rounded-lg p-4 border border-border overflow-x-auto">
        {/* Grid lines */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {yAxisLabels.slice(1).map((_, index) => (
              <div
                key={index}
                className="absolute w-full border-b border-border opacity-30"
                style={{
                  bottom: `${((index + 1) / yAxisLabels.length) * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        {/* Chart */}
        <div
          className="relative flex items-flex-end justify-around gap-2 px-4"
          style={{ height: `${height}px` }}
        >
          {chartData.map((item, index) => {
            const barHeight =
              maxValue > 0 ? (item.value / maxValue) * maxBarHeight : 0

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 min-w-12"
              >
                {/* Bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: getCategoryColor(index),
                  }}
                  title={`${item.name}: ₹${item.value}`}
                />

                {/* Value on top of bar */}
                {showValues && barHeight > 30 && (
                  <div className="text-xs font-semibold text-text -mt-6">
                    {formatChartAxis(item.value)}
                  </div>
                )}

                {/* Label */}
                <div className="text-xs text-muted text-center truncate w-full mt-1">
                  {item.emoji && <span>{item.emoji}</span>}
                  <span className="block text-xs truncate">{item.name}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 bottom-12 w-12 pointer-events-none flex flex-col justify-between text-xs text-muted text-right pr-2">
          {yAxisLabels.reverse().map((label, index) => (
            <div key={index} className="h-0 flex items-center">
              {formatChartAxis(label)}
            </div>
          ))}
        </div>

        {/* Y-axis */}
        <div className="absolute left-12 top-4 bottom-12 border-l border-border opacity-50" />

        {/* X-axis */}
        <div className="absolute left-12 bottom-12 right-0 border-b border-border opacity-50" />
      </div>
    </div>
  )
}
