"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  progress?: number
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({ label, value, subtitle, progress, icon, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">{progress}% complete</span>
        </div>
      )}
    </div>
  )
}
