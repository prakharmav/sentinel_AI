"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "threat-map": "Threat Map",
  "live-feed": "Live Feed",
  graph: "Graph Explorer",
  analytics: "Analytics",
  "ai-query": "AI Query",
  fir: "FIR Manager",
  citizen: "Citizen Portal",
  chat: "Chat",
  settings: "Settings",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded p-0.5"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const isLast = i === segments.length - 1
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            {isLast ? (
              <span className="text-xs font-medium text-foreground" aria-current="page">{label}</span>
            ) : (
              <Link href={href} className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-ring rounded px-0.5">
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
