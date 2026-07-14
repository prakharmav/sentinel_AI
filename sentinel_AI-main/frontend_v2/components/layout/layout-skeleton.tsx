"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LayoutSkeleton() {
  return (
    <div className="flex h-screen" role="status" aria-label="Loading application layout">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex flex-col w-60 border-r bg-card p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 4 }).map((_, g) => (
          <div key={g} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Navbar skeleton */}
        <div className="flex items-center justify-between h-14 px-4 border-b">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded lg:hidden" />
            <Skeleton className="h-3 w-32 hidden md:block" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-40 rounded-md hidden sm:block" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading application</span>
    </div>
  )
}
