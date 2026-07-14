"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"

interface LineChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  className?: string
  showDots?: boolean
}

export function LineChart({ data, title, subtitle, className, showDots = true }: LineChartProps) {
  const colors = useChartColors(1)
  const max = Math.max(...data.map((d) => d.value), 1)
  const padding = 10
  const width = 100
  const height = 50

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - ((d.value / max) * (height - padding * 2)),
  }))

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" role="img" aria-label={title || "Line chart"}>
        <path d={pathD} fill="none" stroke={colors[0]} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        {showDots && points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="1.5" fill={colors[0]} className="transition-all hover:r-[2.5]" />
            <title>{`${data[i].label}: ${data[i].value}`}</title>
          </g>
        ))}
      </svg>
    </ChartContainer>
  )
}
