import * as React from "react"
import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  className,
  title = "No data available",
  description = "There are no records matching your request at the moment.",
  icon = <FolderOpen className="h-10 w-10 text-on-surface-variant" />,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-outline/10 bg-surface-container/50 min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="mb-4 p-4 bg-surface-container-high rounded-full border border-outline/5">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
