"use client"

import * as React from "react"
import { User, LogOut, Settings, Shield, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

const menuItems = [
  { label: "Profile", icon: <User className="w-4 h-4" />, href: "#" },
  { label: "Security", icon: <Shield className="w-4 h-4" />, href: "#" },
  { label: "Settings", icon: <Settings className="w-4 h-4" />, href: "/settings" },
]

export function ProfileMenu() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors focus-ring"
        aria-label="User menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
          SO
        </div>
        <span className="hidden md:block text-sm text-foreground font-medium">SOC Admin</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-lg border bg-popover shadow-lg z-50 overflow-hidden"
            role="menu"
          >
            <div className="px-3 py-3 border-b">
              <p className="text-sm font-medium text-foreground">SOC Administrator</p>
              <p className="text-xs text-muted-foreground">admin@sentinelai.gov.in</p>
            </div>
            <div className="p-1">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-ring"
                  role="menuitem"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
            <div className="p-1 border-t">
              <button
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors focus-ring"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
