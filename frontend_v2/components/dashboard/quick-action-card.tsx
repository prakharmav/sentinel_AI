"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface QuickActionCardProps {
  label: string
  description?: string
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function QuickActionCard({ label, description, icon, onClick, disabled = false, className }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left transition-all",
        "hover:shadow-md hover:border-primary/30 hover:bg-accent/50",
        "active:scale-[0.98]",
        "focus-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        "group",
        className
      )}
    >
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-3 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-foreground tracking-tight mb-0.5">{label}</h4>
      {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
    </button>
  )
}
