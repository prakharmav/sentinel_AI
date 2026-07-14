"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/store"
import { useRouter } from "next/navigation"
import {
  Search, LayoutDashboard, Share2, BarChart3, FileText,
  MessageSquare, Users, Settings, BrainCircuit, Map, Radio, X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  group: string
}

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useAppStore()
  const { toggleCommandPalette } = useAppStore()
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const navigate = React.useCallback((path: string) => {
    router.push(path)
    closeCommandPalette()
  }, [router, closeCommandPalette])

  const commands: CommandItem[] = React.useMemo(() => [
    { id: "dashboard", label: "Go to Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, action: () => navigate("/dashboard"), group: "Navigation" },
    { id: "threat-map", label: "Go to Threat Map", icon: <Map className="w-4 h-4" />, action: () => navigate("/threat-map"), group: "Navigation" },
    { id: "live-feed", label: "Go to Live Feed", icon: <Radio className="w-4 h-4" />, action: () => navigate("/live-feed"), group: "Navigation" },
    { id: "graph", label: "Go to Graph Explorer", icon: <Share2 className="w-4 h-4" />, action: () => navigate("/graph"), group: "Navigation" },
    { id: "analytics", label: "Go to Analytics", icon: <BarChart3 className="w-4 h-4" />, action: () => navigate("/analytics"), group: "Navigation" },
    { id: "ai-query", label: "Go to AI Query", icon: <BrainCircuit className="w-4 h-4" />, action: () => navigate("/ai-query"), group: "Navigation" },
    { id: "fir", label: "Go to FIR Manager", icon: <FileText className="w-4 h-4" />, action: () => navigate("/fir"), group: "Navigation" },
    { id: "citizen", label: "Go to Citizen Portal", icon: <Users className="w-4 h-4" />, action: () => navigate("/citizen"), group: "Navigation" },
    { id: "chat", label: "Go to Chat", icon: <MessageSquare className="w-4 h-4" />, action: () => navigate("/chat"), group: "Navigation" },
    { id: "settings", label: "Go to Settings", icon: <Settings className="w-4 h-4" />, action: () => navigate("/settings"), group: "Navigation" },
  ], [navigate])

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  const groups = React.useMemo(() => {
    const map: Record<string, CommandItem[]> = {}
    filtered.forEach((c) => {
      if (!map[c.group]) map[c.group] = []
      map[c.group].push(c)
    })
    return map
  }, [filtered])

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggleCommandPalette()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [toggleCommandPalette])

  // Focus input on open
  React.useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("")
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault()
      filtered[activeIndex].action()
    } else if (e.key === "Escape") {
      closeCommandPalette()
    }
  }, [filtered, activeIndex, closeCommandPalette])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-50 w-full max-w-lg rounded-xl border bg-popover shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 px-4 border-b">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                aria-label="Search commands"
              />
              <button onClick={closeCommandPalette} className="p-1 rounded hover:bg-accent text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No results found.</p>
              )}
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 py-1.5">{group}</p>
                  {items.map((item) => {
                    const flatIndex = filtered.indexOf(item)
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          flatIndex === activeIndex ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                        )}
                        role="option"
                        aria-selected={flatIndex === activeIndex}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-muted-foreground">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
