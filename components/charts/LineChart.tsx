'use client'

import React, { useMemo } from 'react'
import { formatChartAxis, ChartDataPoint } from '@/lib/chartUtils'
import { cn } from '@/lib/utils'

interface LineChartProps {
  data: ChartDataPoint[]
  title?: string
  className?: string
  height?: number
  showGrid?: boolean
  strokeWidth?: number
  color?: string
  period?: '3m' | '6m' | '1y'
}

export function LineChart({
  data,
  title,
  className,
  height = 300,
  showGrid = true,
  strokeWidth = 2,
  color,
  period = '3m',
}: LineChartProps) {
  const lineColor = color || '#c8f060'

  const { minValue, maxValue, points } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minValue: 0, maxValue: 100, points: [] }
    }

    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const padding = (max - min) * 0.1 || 10

    return {
      minValue: Math.max(0, min - padding),
      maxValue: max + padding,
      points: data,
    }
  }, [data])

  const yAxisLabels = useMemo(() => {
    const range = maxValue - minValue
    const step = range / 4
    return [
      minValue,
      minValue + step,
      minValue + step * 2,
      minValue + step * 3,
      maxValue,
    ]
  }, [minValue, maxValue])

  const yScale = (value: number) => {
    const range = maxValue - minValue
    return range > 0 ? ((value - minValue) / range) * (height - 40) : 0
  }

  // Generate SVG path
  const pathData = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * (100 - 60) + 60
      const y = height - 30 - yScale(point.value)
      return `${x}% ${y}px`
    })
    .join(' L ')

  return (
    <div className={cn('w-full', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-text mb-4">{title}</h3>
      )}

      <div className="relative w-full bg-bg2 rounded-lg p-4 border border-border overflow-hidden">
        {/* Y-axis labels and grid */}
        <div className="absolute top-4 left-8 right-4 h-full pointer-events-none">
          {showGrid &&
            yAxisLabels.map((_, index) => (
              <div
                key={index}
                className="absolute w-full border-b border-border opacity-30"
                style={{
                  top: `${(index / (yAxisLabels.length - 1)) * 100}%`,
                  transform: 'translateY(-50%)',
                }}
              />
            ))}
        </div>

        {/* Chart */}
        <svg
          className="w-full"
          style={{ height: `${height}px` }}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Y-axis */}
          <line
            x1="5%"
            y1="10"
            x2="5%"
            y2={height - 30}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />

          {/* X-axis */}
          <line
            x1="5%"
            y1={height - 30}
            x2="100%"
            y2={height - 30}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />

          {/* Line */}
          {pathData && (
            <polyline
              points={pathData}
              fill="none"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Dots */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / (points.length - 1)) * (100 - 10) + 5}%`}
              cy={height - 30 - yScale(point.value)}
              r="3"
              fill={lineColor}
              opacity="0.8"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-4 bottom-10 w-12 pointer-events-none flex flex-col justify-around text-xs text-muted text-right pr-2">
          {yAxisLabels.map((label, index) => (
            <div key={index} className="h-0 flex items-center">
              {formatChartAxis(label)}
            </div>
          ))}
        </div>

        {/* X-axis labels */}
        <div className={`absolute left-16 right-0 -bottom-8 h-8 flex justify-between px-2 whitespace-nowrap overflow-hidden`}
          style={{
            fontSize: period === '1y' ? '9px' : '12px',
          }}
        >
          {points.map((point, index) => {
            // For 1Y (12+ points): show first, last, and 1-2 middle points
            let shouldShow = false;
            if (points.length <= 6) {
              shouldShow = true; // Show all for 3m/6m
            } else {
              // For 1Y: show only key points
              shouldShow = index === 0 ||
                          index === points.length - 1 ||
                          index === Math.floor(points.length / 3) ||
                          index === Math.floor((points.length * 2) / 3);
            }

            return (
              shouldShow && (
                <span
                  key={index}
                  className="text-muted flex-shrink-0 text-center"
                  style={{
                    transform: period === '1y' ? 'rotate(-45deg)' : 'none',
                    transformOrigin: period === '1y' ? 'center bottom' : 'center',
                    marginBottom: period === '1y' ? '8px' : '0',
                  }}
                >
                  {point.date}
                </span>
              )
            );
          })}
        </div>
      </div>
    </div>
  )
}
