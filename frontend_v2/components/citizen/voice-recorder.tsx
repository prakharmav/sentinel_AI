"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string) => void
  languages?: { label: string; value: string }[]
  className?: string
}

const defaultLanguages = [
  { label: "English", value: "en" },
  { label: "Hindi (हिंदी)", value: "hi" },
  { label: "Kannada (ಕನ್ನಡ)", value: "kn" },
]

export function VoiceRecorder({ onRecordingComplete, languages = defaultLanguages, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const [lang, setLang] = React.useState("en")
  const [recordingTime, setRecordingTime] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggle = () => {
    if (isRecording) {
      setIsRecording(false)
      onRecordingComplete("mock-audio-intake-url.wav")
    } else {
      setIsRecording(true)
    }
  }

  return (
    <div className={cn("rounded-xl border bg-card p-5 flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex gap-2">
        {languages.map((l) => (
          <button
            key={l.value}
            disabled={isRecording}
            onClick={() => setLang(l.value)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-all disabled:opacity-50",
              lang === l.value ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-accent text-muted-foreground"
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center my-4">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute w-20 h-20 rounded-full bg-red-500/20"
            />
          )}
        </AnimatePresence>
        <button
          onClick={handleToggle}
          className={cn(
            "relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-white active:scale-95 transition-all focus-ring",
            isRecording ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/30" : "bg-primary hover:bg-primary/90"
          )}
          aria-label={isRecording ? "Stop voice report recording" : "Start voice report recording"}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex flex-col items-center">
        <span className={cn("text-sm font-bold", isRecording ? "text-red-500" : "text-muted-foreground")}>
          {isRecording ? `Recording... [ ${formatTime(recordingTime)} ]` : "Ready to record report"}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">English, Hindi, and Kannada voice intake supported.</span>
      </div>
    </div>
  )
}
