"use client"

import { motion } from "framer-motion"
import { BrainCircuit } from "lucide-react"

interface AIThinkingLoaderProps {
  message?: string
}

export function AIThinkingLoader({ message = "AI is analyzing threat patterns..." }: AIThinkingLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]" role="status" aria-label="AI processing">
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <BrainCircuit className="w-7 h-7 text-primary" />
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground text-center">
        {message}
      </p>
      <span className="sr-only">{message}</span>
    </div>
  )
}
