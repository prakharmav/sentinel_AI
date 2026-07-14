"use client"

import { FileX } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoFIRFoundProps {
  action?: React.ReactNode
}

export function NoFIRFound({ action }: NoFIRFoundProps) {
  return (
    <EmptyStateBase
      icon={<FileX className="w-7 h-7 text-muted-foreground/50" />}
      title="No FIR Found"
      description="No First Information Reports match your search criteria. Try broadening your query or filing a new report."
      action={action}
    />
  )
}
