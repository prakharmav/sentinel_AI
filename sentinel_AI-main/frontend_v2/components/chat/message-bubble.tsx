"use client"

import * as React from "react"
import { Volume2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Message {
  sender: "user" | "ai"
  text: string
  translation?: string
  timestamp: string
}

interface MessageBubbleProps {
  message: Message
  onPlayTTS?: (text: string) => void
  className?: string
}

export function MessageBubble({ message, onPlayTTS, className }: MessageBubbleProps) {
  const [showTranslation, setShowTranslation] = React.useState(false)
  const isUser = message.sender === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col max-w-[80%] gap-1.5 p-3.5 rounded-xl text-xs",
        isUser
          ? "bg-primary text-primary-foreground self-end rounded-tr-none"
          : "bg-muted text-foreground self-start rounded-tl-none",
        className
      )}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="font-semibold uppercase tracking-wider text-[9px] opacity-70">
          {isUser ? "You" : "Sentinel AI"}
        </span>
        <span className="opacity-50 text-[9px]">{message.timestamp}</span>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {showTranslation && message.translation ? message.translation : message.text}
      </p>

      <div className="flex items-center gap-2 mt-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
        {message.translation && (
          <button
            onClick={() => setShowTranslation((t) => !t)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Translate Message"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        )}
        {!isUser && onPlayTTS && (
          <button
            onClick={() => onPlayTTS(showTranslation && message.translation ? message.translation : message.text)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
            title="Listen to Message (TTS)"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
