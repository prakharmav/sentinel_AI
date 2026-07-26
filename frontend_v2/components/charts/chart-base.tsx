"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface BaseChartProps {
  title?: string
  subtitle?: string
  className?: string
  children: React.ReactNode
}

export function ChartContainer({ title, subtitle, className, children }: BaseChartProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

export function useChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `hsl(var(--chart-${(i % 8) + 1}))`)
}
