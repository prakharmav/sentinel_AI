"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"
import { cn } from "@/lib/utils"

interface BarChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  max?: number
  className?: string
  orientation?: "vertical" | "horizontal"
}

export function BarChart({ data, title, subtitle, max, className, orientation = "vertical" }: BarChartProps) {
  const colors = useChartColors(data.length)
  const highest = max || Math.max(...data.map((d) => d.value), 1)

  if (orientation === "horizontal") {
    return (
      <ChartContainer title={title} subtitle={subtitle} className={className}>
        <div className="space-y-3" role="img" aria-label={title || "Bar chart"}>
          {data.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(item.value / highest) * 100}%`, backgroundColor: item.color || colors[i] }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <div className="flex items-end gap-2 h-48" role="img" aria-label={title || "Bar chart"}>
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-end flex-1 h-full gap-2 group">
            <div
              className="w-full rounded-t-sm transition-all duration-500 ease-out relative group-hover:opacity-90"
              style={{ height: `${(item.value / highest) * 100}%`, backgroundColor: item.color || colors[i] }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-semibold bg-popover text-popover-foreground px-2 py-0.5 rounded shadow-sm transition-opacity pointer-events-none whitespace-nowrap">
                {item.value}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  )
}
