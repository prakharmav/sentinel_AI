"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  label?: string
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-label={label}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
