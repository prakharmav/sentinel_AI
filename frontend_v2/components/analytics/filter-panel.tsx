"use client"

import * as React from "react"
import { Filter, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string
  title: string
  options: FilterOption[]
}

interface FilterPanelProps {
  groups: FilterGroup[]
  selectedFilters: Record<string, string[]>
  onFilterChange: (groupId: string, value: string) => void
  onClearAll?: () => void
  className?: string
}

export function FilterPanel({ groups, selectedFilters, onFilterChange, onClearAll, className }: FilterPanelProps) {
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-4", className)}>
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Filters</h4>
        </div>
        {onClearAll && (
          <button onClick={onClearAll} className="text-xs text-primary hover:underline">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {groups.map((group) => {
          const isOpen = openGroup === group.id
          const groupSelected = selectedFilters[group.id] || []

          return (
            <div key={group.id} className="border-b last:border-0 pb-2 last:pb-0">
              <button
                onClick={() => setOpenGroup(isOpen ? null : group.id)}
                className="flex items-center justify-between w-full py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                aria-expanded={isOpen}
              >
                <span>
                  {group.title}
                  {groupSelected.length > 0 && ` (${groupSelected.length})`}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 py-2">
                      {group.options.map((opt) => {
                        const checked = groupSelected.includes(opt.value)
                        return (
                          <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onFilterChange(group.id, opt.value)}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            {opt.label}
                          </label>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
