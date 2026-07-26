"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background" role="status" aria-label="Loading page">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Sentinel<span className="text-primary">AI</span>
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Initializing secure session...
          </span>
        </div>
      </motion.div>
      <span className="sr-only">Loading SentinelAI application</span>
    </div>
  )
}
