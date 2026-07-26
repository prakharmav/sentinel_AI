"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function GraphLoader({ className }: { className?: string }) {
  const nodes = [
    { x: 50, y: 30 }, { x: 20, y: 60 }, { x: 80, y: 60 },
    { x: 35, y: 85 }, { x: 65, y: 85 },
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]]

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 min-h-[300px]", className)} role="status" aria-label="Loading graph network">
      <svg viewBox="0 0 100 100" className="w-32 h-32 mb-6">
        {edges.map(([from, to], i) => (
          <motion.line
            key={`edge-${i}`}
            x1={nodes[from].x} y1={nodes[from].y}
            x2={nodes[to].x} y2={nodes[to].y}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeOpacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
        {nodes.map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={node.x} cy={node.y} r="3"
            fill="hsl(var(--primary))"
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </svg>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Mapping network topology...
      </p>
      <span className="sr-only">Loading graph network visualization</span>
    </div>
  )
}
