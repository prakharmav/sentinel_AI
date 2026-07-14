import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-primary text-on-primary shadow hover:bg-primary/80",
    secondary: "border-transparent bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
    destructive: "border-transparent bg-error text-white shadow hover:bg-error/80",
    outline: "text-on-surface border border-outline/25",
    success: "border-transparent bg-success/20 text-success border border-success/30",
    warning: "border-transparent bg-warning/20 text-warning border border-warning/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }