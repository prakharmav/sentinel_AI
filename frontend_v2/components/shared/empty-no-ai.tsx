"use client"

import { BrainCircuit } from "lucide-react"
import { EmptyStateBase } from "@/components/shared/empty-state-base"

interface NoAIResponseProps {
  action?: React.ReactNode
}

export function NoAIResponse({ action }: NoAIResponseProps) {
  return (
    <EmptyStateBase
      icon={<BrainCircuit className="w-7 h-7 text-muted-foreground/50" />}
      title="No AI Response"
      description="The AI engine has not generated any insights for this query yet. Submit a prompt or wait for the analysis to complete."
      action={action}
    />
  )
}
