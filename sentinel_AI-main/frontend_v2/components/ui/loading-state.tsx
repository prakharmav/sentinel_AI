"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = "Processing...", fullScreen = false }: LoadingStateProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-8 min-h-[200px]"

  return (
    <div className={containerClasses}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary opacity-80" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground"
      >
        {message}
      </motion.p>
    </div>
  )
}
