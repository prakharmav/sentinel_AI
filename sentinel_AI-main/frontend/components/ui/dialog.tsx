"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all"
        onClick={() => onOpenChange(false)}
      />
      {/* Container */}
      <div className="z-50 w-full max-w-lg border border-outline/10 bg-background p-6 shadow-lg rounded-2xl md:w-full transform transition-all duration-300">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClose: () => onOpenChange(false) } as any)
          }
          return child;
        })}
      </div>
    </div>
  )
}

export function DialogContent({ children, onClose, className }: any) {
  return (
    <div className={cn("relative flex flex-col gap-4", className)}>
      <button
        onClick={onClose}
        className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: any) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: any) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight text-on-surface", className)}
      {...props}
    />
  )
}

export function DialogDescription({ className, ...props }: any) {
  return (
    <p
      className={cn("text-sm text-on-surface-variant", className)}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: any) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}
      {...props}
    />
  )
}