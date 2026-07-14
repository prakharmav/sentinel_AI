"use client"

import { Share2 } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoNetworkGraphProps {
  action?: React.ReactNode
}

export function NoNetworkGraph({ action }: NoNetworkGraphProps) {
  return (
    <EmptyStateBase
      icon={<Share2 className="w-7 h-7 text-muted-foreground/50" />}
      title="No Network Graph"
      description="No fraud ring or money trail data is available for visualization. Run a community detection algorithm to populate the graph."
      action={action}
    />
  )
}
