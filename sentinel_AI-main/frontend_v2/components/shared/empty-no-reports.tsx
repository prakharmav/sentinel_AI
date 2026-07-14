"use client"

import { FileBarChart } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoReportsProps {
  action?: React.ReactNode
}

export function NoReports({ action }: NoReportsProps) {
  return (
    <EmptyStateBase
      icon={<FileBarChart className="w-7 h-7 text-muted-foreground/50" />}
      title="No Reports Generated"
      description="There are no reports available for this period. Generate a new sealed PDF report to view analytics and evidence summaries."
      action={action}
    />
  )
}
