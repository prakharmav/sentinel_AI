"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CrimeCardProps {
  title: string
  category: string
  location: string
  timestamp: string
  status: "open" | "investigating" | "resolved" | "escalated"
  severity: "critical" | "high" | "medium" | "low"
  className?: string
  onClick?: () => void
}

const statusColors = {
  open: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  investigating: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  escalated: "bg-red-500/20 text-red-500 border-red-500/30",
}

const severityDots = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
}

export function CrimeCard({ title, category, location, timestamp, status, severity, className, onClick }: CrimeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 focus-ring",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shrink-0", severityDots[severity])} />
          <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0", statusColors[status])}>
          {status}
        </span>
      </div>
      <Badge variant="secondary" className="text-[10px] mb-2">{category}</Badge>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timestamp}</span>
      </div>
    </button>
  )
}
