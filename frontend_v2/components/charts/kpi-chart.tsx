"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPIChartProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function KPIChart({ label, value, change, changeLabel, icon, className }: KPIChartProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus
  const trendColor = isPositive ? "text-emerald-500" : isNegative ? "text-red-500" : "text-muted-foreground"

  return (
    <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
          <span className={cn("text-xs font-medium", trendColor)}>
            {isPositive && "+"}{change}%
          </span>
          {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
