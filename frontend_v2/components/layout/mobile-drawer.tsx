"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/store"
import { X, Shield } from "lucide-react"
import { navGroups } from "./sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileDrawer() {
  const { mobileDrawerOpen, closeMobileDrawer } = useAppStore()
  const pathname = usePathname()

  // Close on route change
  React.useEffect(() => {
    closeMobileDrawer()
  }, [pathname, closeMobileDrawer])

  // Prevent body scroll
  React.useEffect(() => {
    if (mobileDrawerOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [mobileDrawerOpen])

  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileDrawer}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          />
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r shadow-2xl flex flex-col lg:hidden"
            role="dialog"
            aria-label="Mobile navigation"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Sentinel<span className="text-primary">AI</span>
                </span>
              </div>
              <button
                onClick={closeMobileDrawer}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all focus-ring",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-4 py-3 shrink-0">
              <p className="text-[10px] text-muted-foreground text-center">SentinelAI v2.0 — Secure Session</p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}
