"use client"

import { ShieldOff } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoCrimeDataProps {
  action?: React.ReactNode
}

export function NoCrimeData({ action }: NoCrimeDataProps) {
  return (
    <EmptyStateBase
      icon={<ShieldOff className="w-7 h-7 text-muted-foreground/50" />}
      title="No Crime Data Available"
      description="There are no crime incidents matching your current filters or time range. Adjust your parameters or check back later."
      action={action}
    />
  )
}
