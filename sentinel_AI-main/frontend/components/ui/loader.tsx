import * as React from "react"
import { cn } from "@/lib/utils"

export function Loader({ className, size = "md", ...props }: any) {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent",
        sizeStyles[size as 'sm' | 'md' | 'lg'] || sizeStyles.md,
        className
      )}
      style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)' }}
      {...props}
    />
  )
}
