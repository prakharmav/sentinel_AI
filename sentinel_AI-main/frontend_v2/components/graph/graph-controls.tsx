"use client"

import * as React from "react"
import { ZoomIn, ZoomOut, Maximize2, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface GraphControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitScreen: () => void
  isLayoutPaused: boolean
  onToggleLayout: () => void
  className?: string
}

export function GraphControls({
  onZoomIn,
  onZoomOut,
  onFitScreen,
  isLayoutPaused,
  onToggleLayout,
  className,
}: GraphControlsProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-1.5 rounded-lg border bg-popover shadow-md w-fit", className)} role="toolbar" aria-label="Graph visualization controls">
      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onFitScreen}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
        title="Fit to Screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      <div className="h-px bg-border my-0.5" />
      <button
        onClick={onToggleLayout}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
        title={isLayoutPaused ? "Resume Layout Physics" : "Pause Layout Physics"}
      >
        {isLayoutPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>
    </div>
  )
}
