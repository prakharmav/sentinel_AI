"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LegendItem {
  type: string
  color: string
}

interface GraphLegendProps {
  items: LegendItem[]
  className?: string
}

export function GraphLegend({ items, className }: GraphLegendProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 p-3 rounded-lg border bg-popover shadow-sm w-fit", className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 border-r pr-4">Legend</span>
      <div className="flex items-center gap-3 flex-wrap">
        {items.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
