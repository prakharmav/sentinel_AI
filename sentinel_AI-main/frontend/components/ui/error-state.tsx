import * as React from "react"
import { AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  className,
  title = "An error occurred",
  description = "We were unable to load the requested information. Please try again.",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-error/20 bg-error/5 min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="mb-4 p-4 bg-error/15 text-error rounded-full border border-error/10">
        <AlertOctagon className="h-10 w-10" />
      </div>
      <h3 className="font-semibold text-lg text-on-surface mb-1">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" className="border-error/20 hover:bg-error/10 text-error" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
