"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NodeData {
  id: string
  label: string
  type: "Entity" | "Account" | "IP" | "Phone" | "Case"
  details: Record<string, string | number>
}

interface NodeDetailSideSheetProps {
  node: NodeData | null
  onClose: () => void
  className?: string
}

export function NodeDetailSideSheet({ node, onClose, className }: NodeDetailSideSheetProps) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed right-0 top-0 bottom-0 z-40 w-80 border-l bg-card p-6 shadow-2xl flex flex-col gap-6",
            className
          )}
          role="dialog"
          aria-label="Node detail sheet"
        >
          <div className="flex items-center justify-between border-b pb-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{node.type}</span>
              <h4 className="text-sm font-semibold text-foreground truncate max-w-[200px] mt-0.5">{node.label}</h4>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
              aria-label="Close detailed panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Properties</span>
              <div className="space-y-2.5">
                {Object.entries(node.details).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-xs font-semibold text-foreground break-all">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
