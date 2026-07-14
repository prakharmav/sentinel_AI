"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ChartLoader() {
  return (
    <div className="w-full border rounded-xl p-6 space-y-4" role="status" aria-label="Loading chart">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${Math.random() * 60 + 30}%` }}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`legend-${i}`} className="h-3 w-16" />
        ))}
      </div>
      <span className="sr-only">Loading chart</span>
    </div>
  )
}
