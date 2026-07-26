"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react"

const alertCardVariants = cva("rounded-xl border p-4 flex items-start gap-3 transition-all", {
  variants: {
    severity: {
      critical: "border-red-500/30 bg-red-500/5",
      high: "border-orange-500/30 bg-orange-500/5",
      medium: "border-yellow-500/30 bg-yellow-500/5",
      low: "border-blue-500/30 bg-blue-500/5",
      info: "border-border bg-card",
    },
  },
  defaultVariants: { severity: "info" },
})

const iconMap = {
  critical: <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />,
  high: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />,
  medium: <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />,
  low: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-muted-foreground shrink-0" />,
}

interface AlertCardProps extends VariantProps<typeof alertCardVariants> {
  title: string
  description: string
  timestamp?: string
  action?: React.ReactNode
  className?: string
}

export function AlertCard({ title, description, timestamp, severity, action, className }: AlertCardProps) {
  return (
    <div className={cn(alertCardVariants({ severity }), className)} role="alert">
      {iconMap[severity || "info"]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
          {timestamp && <span className="text-[10px] text-muted-foreground shrink-0">{timestamp}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}
