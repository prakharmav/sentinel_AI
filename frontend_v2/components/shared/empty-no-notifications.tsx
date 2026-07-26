"use client"

import { BellOff } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoNotificationsProps {
  action?: React.ReactNode
}

export function NoNotifications({ action }: NoNotificationsProps) {
  return (
    <EmptyStateBase
      icon={<BellOff className="w-7 h-7 text-muted-foreground/50" />}
      title="No Notifications"
      description="You're all caught up. There are no pending alerts, system messages, or threat notifications at this time."
      action={action}
    />
  )
}
