"use client"

import * as React from "react"
import { ChartContainer, type ChartDataPoint, useChartColors } from "./chart-base"
import { cn } from "@/lib/utils"

interface PredictionChartProps {
  actual: ChartDataPoint[]
  predicted: ChartDataPoint[]
  title?: string
  subtitle?: string
  className?: string
}

export function PredictionChart({ actual, predicted, title, subtitle, className }: PredictionChartProps) {
  const allValues = [...actual, ...predicted].map((d) => d.value)
  const max = Math.max(...allValues, 1)
  const totalPoints = Math.max(actual.length, predicted.length)
  const width = 200
  const height = 60
  const padding = 6

  const toPoints = (data: ChartDataPoint[]) =>
    data.map((d, i) => ({
      x: padding + (i / (totalPoints - 1 || 1)) * (width - padding * 2),
      y: height - padding - ((d.value / max) * (height - padding * 2)),
    }))

  const actualPts = toPoints(actual)
  const predictedPts = toPoints(predicted)

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  return (
    <ChartContainer title={title} subtitle={subtitle} className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" role="img" aria-label={title || "Prediction chart"}>
        <path d={toPath(actualPts)} fill="none" stroke="hsl(var(--chart-1))" strokeWidth="1.2" strokeLinecap="round" />
        <path d={toPath(predictedPts)} fill="none" stroke="hsl(var(--chart-4))" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="3 2" />
        {actualPts.map((p, i) => (
          <circle key={`a-${i}`} cx={p.x} cy={p.y} r="1.5" fill="hsl(var(--chart-1))">
            <title>{`Actual - ${actual[i]?.label}: ${actual[i]?.value}`}</title>
          </circle>
        ))}
        {predictedPts.map((p, i) => (
          <circle key={`p-${i}`} cx={p.x} cy={p.y} r="1.5" fill="hsl(var(--chart-4))" opacity="0.7">
            <title>{`Predicted - ${predicted[i]?.label}: ${predicted[i]?.value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex gap-6 justify-center mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-4 h-0.5 bg-[hsl(var(--chart-1))] rounded" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-4 h-0.5 bg-[hsl(var(--chart-4))] rounded border-dashed" style={{ borderTop: "2px dashed hsl(var(--chart-4))", height: 0 }} />
          <span>Predicted</span>
        </div>
      </div>
    </ChartContainer>
  )
}
