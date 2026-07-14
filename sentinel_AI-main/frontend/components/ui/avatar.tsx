import * as React from "react"
import { cn } from "@/lib/utils"

export function Avatar({ className, children, ...props }: any) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline/10 bg-surface-container",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarImage({ className, src, alt, ...props }: any) {
  return (
    <img
      src={src}
      alt={alt || "Avatar"}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
}

export function AvatarFallback({ className, children, ...props }: any) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-semibold text-on-surface-variant",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
