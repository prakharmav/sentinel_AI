"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store"
import { Menu, Search, Bell, Command } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { ProfileMenu } from "./profile-menu"
import { Breadcrumb } from "./breadcrumb"

export function TopNavbar() {
  const { toggleMobileDrawer, toggleCommandPalette, toggleNotifications } = useAppStore()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-card/80 backdrop-blur-xl">
      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileDrawer}
          className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Command palette trigger */}
        <button
          onClick={toggleCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-background text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all focus-ring"
          aria-label="Open command palette"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={toggleCommandPalette}
          className="sm:hidden p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          className="relative p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  )
}
