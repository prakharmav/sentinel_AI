"use client"

import { AlertTriangle, RefreshCcw } from "lucide-react"
import { motion } from "framer-motion"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = "System Error", 
  message = "An unexpected error occurred while communicating with the telemetry server.",
  onRetry 
}: ErrorStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 min-h-[300px] border border-destructive/20 bg-destructive/5 rounded-lg max-w-lg mx-auto text-center"
    >
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </motion.div>
  )
}
