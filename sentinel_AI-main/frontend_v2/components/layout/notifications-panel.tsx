"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useAppStore } from "@/store"
import { X, Bell, ShieldAlert, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  type: "critical" | "warning" | "info" | "success"
  timestamp: string
  read: boolean
}

const iconMap = {
  critical: <ShieldAlert className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
}

const sampleNotifications: Notification[] = [
  { id: "1", title: "Critical Alert", description: "Fraud ring detected in sector 7-B with 12 linked accounts.", type: "critical", timestamp: "2m ago", read: false },
  { id: "2", title: "AI Analysis Complete", description: "Predictive model flagged 3 high-risk zones for next 48 hours.", type: "warning", timestamp: "15m ago", read: false },
  { id: "3", title: "FIR Filed", description: "Case #FIR-2026-4821 has been successfully filed and assigned.", type: "success", timestamp: "1h ago", read: true },
  { id: "4", title: "System Update", description: "Database maintenance scheduled for 03:00 IST tonight.", type: "info", timestamp: "3h ago", read: true },
]

export function NotificationsPanel() {
  const { notificationsOpen, closeNotifications } = useAppStore()
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNotifications() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [closeNotifications])

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNotifications}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l bg-card shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-5 h-14 border-b shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {sampleNotifications.filter((n) => !n.read).length}
                </span>
              </div>
              <button
                onClick={closeNotifications}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sampleNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-5 py-4 border-b transition-colors hover:bg-accent/50 cursor-pointer",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{iconMap[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn("text-sm truncate", !n.read ? "font-semibold text-foreground" : "text-foreground")}>{n.title}</h4>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>

            <div className="border-t px-5 py-3 shrink-0">
              <button className="w-full text-xs text-center text-primary hover:text-primary/80 font-medium transition-colors focus-ring rounded py-1">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
