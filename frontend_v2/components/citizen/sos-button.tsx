"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SOSButtonProps {
  onTrigger: () => void
  className?: string
}

export function SOSButton({ onTrigger, className }: SOSButtonProps) {
  const [countdown, setCountdown] = React.useState<number | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleStart = () => {
    setCountdown(3)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          onTrigger()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCancel = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(null)
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <AnimatePresence mode="wait">
        {countdown === null ? (
          <motion.button
            key="idle"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-500 flex flex-col items-center justify-center text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-95 transition-all border-8 border-red-950 focus-ring"
            aria-label="Hold to Trigger Emergency SOS Alert"
          >
            <AlertOctagon className="w-12 h-12 mb-2 animate-bounce" />
            <span className="text-sm font-bold tracking-wider uppercase">SOS</span>
            <span className="text-[9px] opacity-70">Hold 3 Seconds</span>
          </motion.button>
        ) : (
          <motion.button
            key="countdown"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            onClick={handleCancel}
            className="w-40 h-40 rounded-full bg-red-950 flex flex-col items-center justify-center text-red-500 shadow-[0_0_40px_rgba(220,38,38,0.6)] border-8 border-red-500 focus-ring"
            aria-label={`SOS Triggering in ${countdown} seconds. Click to cancel.`}
          >
            <span className="text-5xl font-black mb-1">{countdown}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancel</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
