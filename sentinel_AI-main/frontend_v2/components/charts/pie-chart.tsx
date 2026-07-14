"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"

interface PieChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  className?: string
  size?: number
  donut?: boolean
}

export function PieChart({ data, title, subtitle, className, size = 140, donut = false }: PieChartProps) {
  const colors = useChartColors(data.length)
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const radius = size / 2 - 8
  const innerRadius = donut ? radius * 0.6 : 0
  const cx = size / 2
  const cy = size / 2

  let cumulative = 0
  const segments = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    cumulative += d.value
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

    const outerStart = { x: cx + radius * Math.cos(startAngle), y: cy + radius * Math.sin(startAngle) }
    const outerEnd = { x: cx + radius * Math.cos(endAngle), y: cy + radius * Math.sin(endAngle) }
    const innerStart = { x: cx + innerRadius * Math.cos(endAngle), y: cy + innerRadius * Math.sin(endAngle) }
    const innerEnd = { x: cx + innerRadius * Math.cos(startAngle), y: cy + innerRadius * Math.sin(startAngle) }

    const pathD = donut
      ? `M ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} L ${innerStart.x} ${innerStart.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`
      : `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`

    return { d: pathD, color: d.color || colors[i], label: d.label, value: d.value }
  })

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <div className="flex flex-col items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={title || "Pie chart"}>
          {segments.map((seg, i) => (
            <path key={i} d={seg.d} fill={seg.color} className="transition-opacity hover:opacity-80 cursor-pointer" stroke="hsl(var(--background))" strokeWidth="1">
              <title>{`${seg.label}: ${seg.value} (${((seg.value / total) * 100).toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
        <div className="flex flex-wrap gap-3 justify-center">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || colors[i] }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}
