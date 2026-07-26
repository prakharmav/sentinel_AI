"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  action: string
  actor: string
  timestamp: string
  icon?: React.ReactNode
}

interface ActivityCardProps {
  title?: string
  items: ActivityItem[]
  className?: string
}

export function ActivityCard({ title = "Recent Activity", items, className }: ActivityCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground tracking-tight mb-4">{title}</h4>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={item.id} className={cn("flex items-start gap-3 py-3", i !== items.length - 1 && "border-b")}>
            {item.icon && <div className="mt-0.5 text-muted-foreground shrink-0">{item.icon}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.actor}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
              <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
