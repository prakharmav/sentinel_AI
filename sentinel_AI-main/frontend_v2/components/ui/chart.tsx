import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartData {
  label: string
  value: number
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartData[]
  max?: number
}

export function CSSChart({ data, max, className, ...props }: ChartProps) {
  const highestValue = max || Math.max(...data.map(d => d.value), 1)

  return (
    <div className={cn("flex items-end gap-2 h-48 w-full p-4 border rounded-xl bg-card", className)} {...props}>
      {data.map((item, i) => {
        const heightPercent = `${(item.value / highestValue) * 100}%`
        return (
          <div key={i} className="flex flex-col items-center justify-end flex-1 h-full gap-2 group">
            <div 
              className="w-full bg-primary/20 rounded-t-sm relative transition-all group-hover:bg-primary/40"
              style={{ height: heightPercent }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-semibold bg-popover text-popover-foreground px-2 py-1 rounded shadow-sm transition-opacity pointer-events-none">
                {item.value}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate w-full text-center">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
