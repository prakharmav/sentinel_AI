"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "warning" | "destructive" | "info"
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void
  toasts: Toast[]
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...options, id }])
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      dismiss(id)
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const variantIcons = {
    default: <Info className="h-5 w-5 text-primary" />,
    info: <Info className="h-5 w-5 text-primary" />,
    success: <CheckCircle className="h-5 w-5 text-success" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    destructive: <AlertCircle className="h-5 w-5 text-error" />,
  }

  const variantStyles = {
    default: "bg-surface-container border-outline/10 text-on-surface",
    info: "bg-surface-container border-outline/10 text-on-surface",
    success: "bg-surface-container border-success/30 text-on-surface",
    warning: "bg-surface-container border-warning/30 text-on-surface",
    destructive: "bg-surface-container border-error/30 text-on-surface",
  }

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transform transition-all duration-300 animate-slide-in-right ${
              variantStyles[t.variant || "default"]
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {variantIcons[t.variant || "default"]}
            </div>
            <div className="flex-1 space-y-1">
              {t.title && <h5 className="font-semibold text-sm leading-none">{t.title}</h5>}
              {t.description && <p className="text-xs text-on-surface-variant leading-relaxed">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 hover:bg-white/5 p-1 rounded-full text-on-surface-variant transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
