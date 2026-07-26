"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EdgeData {
  id: string
  source: string
  target: string
  type: string
  amount?: string | number
  timestamp?: string
}

interface EdgePanelProps {
  edge: EdgeData | null
  onClose: () => void
  className?: string
}

export function EdgePanel({ edge, onClose, className }: EdgePanelProps) {
  return (
    <AnimatePresence>
      {edge && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={cn(
            "absolute bottom-4 left-4 z-30 w-72 rounded-xl border bg-card p-4 shadow-lg flex flex-col gap-2.5",
            className
          )}
        >
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Relationship</span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
              aria-label="Close relation panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-xs font-medium text-foreground py-1 bg-muted/40 px-2 rounded-lg">
            <span className="truncate max-w-[100px]">{edge.source}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[100px]">{edge.target}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-semibold text-foreground capitalize">{edge.type}</span>
            </div>
            {edge.amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Value/Amount:</span>
                <span className="font-semibold text-foreground">{edge.amount}</span>
              </div>
            )}
            {edge.timestamp && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activity Date:</span>
                <span className="font-semibold text-foreground">{edge.timestamp}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
