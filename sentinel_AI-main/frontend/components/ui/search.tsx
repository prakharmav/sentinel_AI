"use client"

import * as React from "react"
import { Search as SearchIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void
  onClear?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onValueChange, onClear, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setInternalValue(v)
      onValueChange?.(v)
      onChange?.(e)
    }

    const handleClear = () => {
      setInternalValue("")
      onValueChange?.("")
      onClear?.()
    }

    return (
      <div className={cn("relative flex items-center", className)}>
        <SearchIcon className="absolute left-3 h-4 w-4 text-on-surface-variant pointer-events-none" />
        <input
          ref={ref}
          type="search"
          value={internalValue}
          onChange={handleChange}
          className="flex h-10 w-full rounded-xl border border-outline/20 bg-background pl-10 pr-10 py-2 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {internalValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded-full hover:bg-white/10 text-on-surface-variant transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
