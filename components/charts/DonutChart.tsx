'use client'

import React, { useMemo } from 'react'
import { getCategoryColor } from '@/lib/chartUtils'
import { cn } from '@/lib/utils'

export interface DonutChartData {
  name: string
  value: number
  emoji?: string
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
  className?: string
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  showValues?: boolean
}

export function DonutChart({
  data,
  title,
  className,
  innerRadius = 45,
  outerRadius = 70,
  showLegend = true,
  showValues = true,
}: DonutChartProps) {

  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    let currentAngle = -90 // Start from top

    return data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      const sliceAngle = (percentage / 100) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      // Outer arc points
      const x1 = 100 + outerRadius * Math.cos(startRad)
      const y1 = 100 + outerRadius * Math.sin(startRad)
      const x2 = 100 + outerRadius * Math.cos(endRad)
      const y2 = 100 + outerRadius * Math.sin(endRad)

      // Inner arc points
      const x3 = 100 + innerRadius * Math.cos(endRad)
      const y3 = 100 + innerRadius * Math.sin(endRad)
      const x4 = 100 + innerRadius * Math.cos(startRad)
      const y4 = 100 + innerRadius * Math.sin(startRad)

      const largeArc = sliceAngle > 180 ? 1 : 0

      const path = `
        M ${x1} ${y1}
        A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `

      currentAngle = endAngle

      return {
        name: item.name,
        value: item.value,
        emoji: item.emoji,
        path,
        percentage,
        color: getCategoryColor(index),
        startAngle,
        endAngle,
      }
    })
  }, [data, innerRadius, outerRadius])

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      )}

      <div className="flex flex-col gap-6">
        {/* Chart */}
        <div className="flex justify-center">
          <svg
            className="w-40 h-40"
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
          >
            {chartData.map((item, index) => (
              <g key={index}>
                <path
                  d={item.path}
                  fill={item.color}
                  stroke="#0e0f11"
                  strokeWidth="2"
                  opacity="0.9"
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
              </g>
            ))}

            {/* Center text */}
            <text
              x="100"
              y="85"
              textAnchor="middle"
              className="text-xs font-semibold fill-text"
            >
              Total
            </text>
            <text
              x="100"
              y="105"
              textAnchor="middle"
              className="text-sm font-semibold fill-accent"
            >
              ₹{(total / 100000).toFixed(1)}L
            </text>
          </svg>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-col gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted flex-1">
                  {item.emoji} {item.name}
                </span>
                {showValues && (
                  <div className="flex gap-2 text-text">
                    <span className="font-semibold">₹{(item.value / 1000).toFixed(0)}K</span>
                    <span className="text-muted">({item.percentage.toFixed(1)}%)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
