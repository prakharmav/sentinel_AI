"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { BrainCircuit, Sparkles } from "lucide-react"

interface AIInsightCardProps {
  title: string
  insight: string
  confidence: number
  model?: string
  timestamp?: string
  tags?: string[]
  className?: string
}

export function AIInsightCard({ title, insight, confidence, model, timestamp, tags, className }: AIInsightCardProps) {
  const confidenceColor =
    confidence >= 80 ? "text-emerald-500" : confidence >= 50 ? "text-yellow-500" : "text-red-500"

  return (
    <div className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-md group", className)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <BrainCircuit className="w-4 h-4 text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className={cn("text-xs font-bold", confidenceColor)}>{confidence}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{insight}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {tags?.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground shrink-0">
          {model && <span>{model}</span>}
          {timestamp && <span>{timestamp}</span>}
        </div>
      </div>
    </div>
  )
}
