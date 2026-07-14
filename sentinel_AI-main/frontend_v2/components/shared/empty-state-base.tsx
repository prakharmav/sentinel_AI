"use client"

import { motion } from "framer-motion"
import { ShieldOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { scaleIn } from "@/lib/animations"

interface EmptyStateBaseProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyStateBase({ icon, title, description, action, className }: EmptyStateBaseProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className={cn(
        "flex flex-col items-center justify-center p-12 min-h-[350px] border border-dashed border-border/50 rounded-xl bg-muted/5 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-muted/20 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
