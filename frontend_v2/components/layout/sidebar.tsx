"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"
import {
  LayoutDashboard, Shield, Share2, BarChart3, FileText,
  MessageSquare, Users, Settings, ChevronLeft, ChevronRight,
  Radio, BrainCircuit, Search as SearchIcon, Map
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string | number
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Command",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Threat Map", href: "/threat-map", icon: <Map className="w-4 h-4" /> },
      { label: "Live Feed", href: "/live-feed", icon: <Radio className="w-4 h-4" /> },
    ],
  },
  {
    title: "Investigation",
    items: [
      { label: "Graph Explorer", href: "/graph", icon: <Share2 className="w-4 h-4" /> },
      { label: "Analytics", href: "/analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "AI Query", href: "/ai-query", icon: <BrainCircuit className="w-4 h-4" /> },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "FIR Manager", href: "/fir", icon: <FileText className="w-4 h-4" /> },
      { label: "Citizen Portal", href: "/citizen", icon: <Users className="w-4 h-4" /> },
      { label: "Chat", href: "/chat", icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebarCollapse } = useAppStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-bold tracking-tight text-foreground">
                Sentinel<span className="text-primary">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && <Shield className="w-5 h-5 text-primary mx-auto" />}
        <button
          onClick={toggleSidebarCollapse}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring hidden lg:flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4" aria-label="Main navigation">
        {navGroups.map((group) => (
          <div key={group.title}>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1.5"
                >
                  {group.title}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-all group focus-ring",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className={cn("shrink-0", isActive && "text-primary")}>{item.icon}</span>
                      <AnimatePresence mode="wait">
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !sidebarCollapsed && (
                        <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 shrink-0">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[10px] text-muted-foreground text-center">v2.0 — Secure Session</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

export { navGroups, type NavItem }
