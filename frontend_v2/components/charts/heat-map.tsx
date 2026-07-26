"use client"

import * as React from "react"
import { ChartContainer } from "./chart-base"
import { cn } from "@/lib/utils"

interface HeatMapCell {
  x: string
  y: string
  value: number
}

interface HeatMapProps {
  data: HeatMapCell[]
  title?: string
  subtitle?: string
  className?: string
}

function getIntensity(value: number, max: number): string {
  const ratio = value / max
  if (ratio > 0.8) return "bg-red-500/90"
  if (ratio > 0.6) return "bg-orange-500/80"
  if (ratio > 0.4) return "bg-yellow-500/70"
  if (ratio > 0.2) return "bg-emerald-500/50"
  return "bg-emerald-500/20"
}

export function HeatMap({ data, title, subtitle, className }: HeatMapProps) {
  const xLabels = Array.from(new Set(data.map((d) => d.x)))
  const yLabels = Array.from(new Set(data.map((d) => d.y)))
  const max = Math.max(...data.map((d) => d.value), 1)

  const getValue = (x: string, y: string) => data.find((d) => d.x === x && d.y === y)?.value ?? 0

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <div className="overflow-x-auto" role="img" aria-label={title || "Heat map"}>
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(28px, 1fr))` }}>
          <div />
          {xLabels.map((x) => (
            <div key={x} className="text-[10px] text-muted-foreground text-center truncate px-1">{x}</div>
          ))}
          {yLabels.map((y) => (
            <React.Fragment key={y}>
              <div className="text-[10px] text-muted-foreground text-right pr-2 flex items-center justify-end">{y}</div>
              {xLabels.map((x) => {
                const val = getValue(x, y)
                return (
                  <div
                    key={`${x}-${y}`}
                    className={cn("w-7 h-7 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-ring", getIntensity(val, max))}
                    title={`${y}, ${x}: ${val}`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </ChartContainer>
  )
}
