"use client"

import { Database } from "lucide-react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({ 
  title = "No Data Found", 
  description = "There are no records matching your current query parameters.",
  icon = <Database className="w-8 h-8 text-muted-foreground/50" />,
  action
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 min-h-[400px] border border-dashed border-border/50 rounded-xl bg-muted/5 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  )
}
