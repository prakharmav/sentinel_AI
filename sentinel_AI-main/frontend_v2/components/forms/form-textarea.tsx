"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  maxLength?: number
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, maxLength, className, id, value, ...props }, ref) => {
    const charCount = typeof value === "string" ? value.length : 0

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
          {maxLength && (
            <span className="text-[10px] text-muted-foreground" aria-live="polite">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive font-medium"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
FormTextarea.displayName = "FormTextarea"
