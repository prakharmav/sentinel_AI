"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface TableLoaderProps {
  rows?: number
  columns?: number
}

export function TableLoader({ rows = 5, columns = 4 }: TableLoaderProps) {
  return (
    <div className="w-full border rounded-lg overflow-hidden" role="status" aria-label="Loading table data">
      <div className="flex gap-4 px-4 py-3 bg-muted/30 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 px-4 py-3 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={`cell-${rowIdx}-${colIdx}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table data</span>
    </div>
  )
}
