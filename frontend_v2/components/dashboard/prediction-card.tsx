"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PredictionCardProps {
  title: string
  prediction: string
  probability: number
  timeframe?: string
  basis?: string
  className?: string
}

export function PredictionCard({ title, prediction, probability, timeframe, basis, className }: PredictionCardProps) {
  const risk = probability >= 70 ? "high" : probability >= 40 ? "medium" : "low"
  const riskColors = { high: "text-red-500 bg-red-500", medium: "text-yellow-500 bg-yellow-500", low: "text-emerald-500 bg-emerald-500" }

  return (
    <div className={cn("rounded-xl border bg-card p-5 transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        {timeframe && <span className="text-[10px] text-muted-foreground">{timeframe}</span>}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{prediction}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Probability</span>
          <span className={cn("text-xs font-bold", riskColors[risk])}>{probability}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", riskColors[risk])}
            style={{ width: `${probability}%` }}
          />
        </div>
        {basis && <p className="text-[10px] text-muted-foreground mt-1">Based on: {basis}</p>}
      </div>
    </div>
  )
}
