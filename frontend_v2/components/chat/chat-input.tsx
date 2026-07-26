"use client"

import * as React from "react"
import { Send, Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
  onVoiceInput?: () => void
  isRecording?: boolean
  className?: string
}

export function ChatInput({ onSend, onVoiceInput, isRecording = false, className }: ChatInputProps) {
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2 p-3 border-t bg-card/50 items-center", className)}>
      {onVoiceInput && (
        <button
          type="button"
          onClick={onVoiceInput}
          className={cn(
            "p-2.5 rounded-lg border transition-all focus-ring active:scale-95",
            isRecording
              ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
          title={isRecording ? "Stop Recording" : "Use Voice Input"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type incident description or ask a query..."
        className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm focus-ring outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="p-2.5 rounded-lg bg-primary text-primary-foreground transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-95"
        title="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
