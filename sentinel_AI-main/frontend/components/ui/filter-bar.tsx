"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Filter, X } from "lucide-react"
import { Badge } from "./badge"
import { Button } from "./button"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

interface FilterBarProps {
  groups: FilterGroup[]
  activeFilters: Record<string, string[]>
  onFilterChange: (groupId: string, values: string[]) => void
  onClearAll?: () => void
  className?: string
}

export function FilterBar({ groups, activeFilters, onFilterChange, onClearAll, className }: FilterBarProps) {
  const totalActive = Object.values(activeFilters).flat().length

  const toggleValue = (groupId: string, value: string) => {
    const current = activeFilters[groupId] || []
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onFilterChange(groupId, next)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {totalActive > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{totalActive}</Badge>
          )}
        </div>
        {totalActive > 0 && onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs gap-1">
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">{group.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((opt) => {
                const isActive = (activeFilters[group.id] || []).includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleValue(group.id, opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-[0.97]",
                      isActive
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "bg-surface-container border-outline/10 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
