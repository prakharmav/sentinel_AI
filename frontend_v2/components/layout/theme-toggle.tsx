"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

const themes = [
  { value: "sentinel-dark", label: "Sentinel Dark", icon: <Moon className="w-4 h-4" /> },
  { value: "government", label: "Government", icon: <Landmark className="w-4 h-4" /> },
  { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const currentIcon = themes.find((t) => t.value === theme)?.icon ?? <Moon className="w-4 h-4" />

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
        aria-label="Change theme"
        aria-expanded={open}
      >
        {currentIcon}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-lg border bg-popover p-1 shadow-lg z-50"
            role="menu"
          >
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); setOpen(false) }}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm transition-colors text-left focus-ring",
                  theme === t.value ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                role="menuitem"
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
