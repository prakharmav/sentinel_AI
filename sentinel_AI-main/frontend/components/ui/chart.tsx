"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartBarProps {
  data: { label: string; value: number; color?: string }[]
  maxValue?: number
  height?: number
  showValues?: boolean
  className?: string
}

export function ChartBar({ data, maxValue, height = 200, showValues = true, className }: ChartBarProps) {
  const max = maxValue || Math.max(...data.map(d => d.value))

  return (
    <div className={cn("flex items-end gap-2 sm:gap-4", className)} style={{ height }}>
      {data.map((item, i) => {
        const barHeight = max > 0 ? (item.value / max) * 100 : 0
        return (
          <div key={i} className="flex flex-col items-center justify-end flex-1 h-full gap-1 group">
            {showValues && (
              <span className="text-xs font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                {item.value}
              </span>
            )}
            <div
              className="w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80 min-w-[12px]"
              style={{
                height: `${barHeight}%`,
                backgroundColor: item.color || 'var(--primary)',
              }}
            />
            <span className="text-[10px] text-on-surface-variant font-medium text-center truncate w-full mt-1">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface ChartDonutProps {
  data: { label: string; value: number; color: string }[]
  size?: number
  strokeWidth?: number
  className?: string
}

export function ChartDonut({ data, size = 160, strokeWidth = 24, className }: ChartDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let cumulativeOffset = 0

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((item, i) => {
          const segmentLength = total > 0 ? (item.value / total) * circumference : 0
          const offset = cumulativeOffset
          cumulativeOffset += segmentLength

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700 ease-out"
            />
          )
        })}
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20 -z-10"
        />
      </svg>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-on-surface-variant">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChartLineProps {
  data: { label: string; value: number }[]
  height?: number
  color?: string
  className?: string
}

export function ChartLine({ data, height = 150, color, className }: ChartLineProps) {
  if (data.length < 2) return null

  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const padding = 16

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - 2 * padding)
    const y = padding + ((max - d.value) / range) * (100 - 2 * padding)
    return `${x},${y}`
  })

  const polylineStr = points.join(" ")
  const areaStr = `${padding},${100 - padding} ${polylineStr} ${100 - padding},${100 - padding}`

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Area fill */}
        <polygon
          points={areaStr}
          fill={color || "var(--primary)"}
          opacity={0.1}
        />
        {/* Line */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke={color || "var(--primary)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Dots */}
        {points.map((p, i) => {
          const [x, y] = p.split(",").map(Number)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill={color || "var(--primary)"}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>
    </div>
  )
}
