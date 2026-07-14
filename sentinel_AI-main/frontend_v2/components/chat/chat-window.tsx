"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  children: React.ReactNode
  className?: string
}

export function ChatWindow({ children, className }: ChatWindowProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [children])

  return (
    <div className={cn("flex flex-col h-[500px] border rounded-xl bg-card overflow-hidden", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {children}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
