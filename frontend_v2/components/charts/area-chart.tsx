"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"

interface AreaChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  className?: string
}

export function AreaChart({ data, title, subtitle, className }: AreaChartProps) {
  const colors = useChartColors(1)
  const max = Math.max(...data.map((d) => d.value), 1)
  const padding = 10
  const width = 100
  const height = 50

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - ((d.value / max) * (height - padding * 2)),
  }))

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaD = `${lineD} L ${points[points.length - 1]?.x ?? padding} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" role="img" aria-label={title || "Area chart"}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.3" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGradient)" />
        <path d={lineD} fill="none" stroke={colors[0]} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </ChartContainer>
  )
}
