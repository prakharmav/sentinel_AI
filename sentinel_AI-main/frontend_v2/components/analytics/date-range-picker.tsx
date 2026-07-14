"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRange {
  start: string
  end: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (val: DateRange) => void
  className?: string
}

const quickSelects = [
  { label: "Last 24 Hours", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const handleQuickSelect = (days: number) => {
    const end = new Date().toISOString().split("T")[0]
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    onChange({ start, end })
  }

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-4", className)}>
      <div className="flex items-center gap-2 border-b pb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Time Range</h4>
      </div>

      <div className="flex gap-2 flex-wrap">
        {quickSelects.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleQuickSelect(opt.days)}
            className="text-xs px-2.5 py-1.5 rounded-lg border hover:bg-accent transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium">Start Date</span>
          <input
            type="date"
            value={value.start}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="w-full bg-transparent border rounded px-2 py-1.5 focus-ring"
          />
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground font-medium">End Date</span>
          <input
            type="date"
            value={value.end}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="w-full bg-transparent border rounded px-2 py-1.5 focus-ring"
          />
        </div>
      </div>
    </div>
  )
}
