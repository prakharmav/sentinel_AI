"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  className?: string
  trend?: "up" | "down" | "flat"
  trendLabel?: string
}

export function TrendChart({ data, title, subtitle, className, trend, trendLabel }: TrendChartProps) {
  const colors = useChartColors(1)
  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 200
  const height = 60
  const padding = 4

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * (width - padding * 2),
    y: height - padding - ((d.value / max) * (height - padding * 2)),
  }))

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaD = `${lineD} L ${points[points.length - 1]?.x ?? padding} ${height} L ${padding} ${height} Z`

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <div className="flex items-end justify-between gap-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="flex-1 h-16" role="img" aria-label={title || "Trend chart"}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.2" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGrad)" />
          <path d={lineD} fill="none" stroke={colors[0]} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {trend && (
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <TrendIcon className={cn("w-4 h-4", trendColor)} />
            {trendLabel && <span className={cn("text-xs font-medium", trendColor)}>{trendLabel}</span>}
          </div>
        )}
      </div>
    </ChartContainer>
  )
}
