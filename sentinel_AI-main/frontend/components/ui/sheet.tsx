"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./button"

export const Sheet = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      <div className="z-50 w-full md:w-[500px] bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClose: () => onOpenChange(false) } as any);
          }
          return child;
        })}
      </div>
    </div>
  )
}

export const SheetContent = ({ children, onClose, className }: any) => {
  return (
    <div className={cn("h-full flex flex-col relative", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-4 z-10 rounded-full"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  )
}

export const SheetHeader = ({ className, children }: any) => (
  <div className={cn("flex flex-col space-y-2 mb-6", className)}>{children}</div>
)

export const SheetTitle = ({ className, children }: any) => (
  <h2 className={cn("text-lg font-semibold text-foreground", className)}>{children}</h2>
)

export const SheetDescription = ({ className, children }: any) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
)
