"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"
import { Sidebar } from "./sidebar"
import { TopNavbar } from "./top-navbar"
import { MobileDrawer } from "./mobile-drawer"
import { CommandPalette } from "./command-palette"
import { NotificationsPanel } from "./notifications-panel"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      <MobileDrawer />

      {/* Main content area */}
      <motion.div
        className="flex-1 flex flex-col min-w-0"
        animate={{ marginLeft: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <TopNavbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6">
            {children}
          </div>
        </main>
      </motion.div>

      {/* Global overlays */}
      <CommandPalette />
      <NotificationsPanel />
    </div>
  )
}
