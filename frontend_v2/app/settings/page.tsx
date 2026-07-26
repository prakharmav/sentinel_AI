"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Settings, ShieldAlert, Cpu, HardDrive, ShieldCheck,
  Save, AlertTriangle, Key, Terminal, Eye, EyeOff
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [autonomyLevel, setAutonomyLevel] = React.useState<"OBSERVE" | "ADVISE" | "CONTAIN" | "REMEDIATE">("CONTAIN")
  const [threshold, setThreshold] = React.useState(0.75)
  const [geminiKey, setGeminiKey] = React.useState("")
  const [showKey, setShowKey] = React.useState(false)
  const [telemetryEnabled, setTelemetryEnabled] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleSave = () => {
    alert("Configuration parameters updated and stored successfully.")
  }

  if (isLoading) {
    return <LayoutSkeleton />
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-4xl"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              System Configurations
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Manage threat engine boundaries, auth secrets, and autonomous thresholds
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>

        {/* Configurations Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Autonomy Level Controls */}
          <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Response Autonomy Limits
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set boundaries for automated security actions (e.g. blocking IPs, revoking tokens).
              </p>
            </div>

            <div className="space-y-3">
              {[
                { level: "OBSERVE", desc: "Audit and generate logs only. Never block or execute containment actions." },
                { level: "ADVISE", desc: "Suggest playbooks and wait for investigator approval before executing responses." },
                { level: "CONTAIN", desc: "Isolate suspect accounts and IP addresses automatically. Request confirmation for high impact remediations." },
                { level: "REMEDIATE", desc: "Autonomous remediation active. Full network level containment, account blockages & rollback operations." }
              ].map((opt) => (
                <div
                  key={opt.level}
                  onClick={() => setAutonomyLevel(opt.level as any)}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-all ${
                    autonomyLevel === opt.level
                      ? "border-primary bg-primary/5 text-foreground shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold font-mono">{opt.level}</span>
                    {autonomyLevel === opt.level && (
                      <Badge className="bg-primary/25 text-primary border-primary/30">Active Mode</Badge>
                    )}
                  </div>
                  <p className="text-[10px] leading-relaxed">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Spatio-Temporal Prediction Thresholds */}
            <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  Alert Thresholds
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Minimum risk probability trigger for regional hotspots alerts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between font-mono text-xs">
                  <span>Threshold Limit:</span>
                  <span className="text-cyan-400 font-bold">{(threshold * 100).toFixed(0)}% Match</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.99"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
                <div className="flex items-start gap-2.5 p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/20 text-yellow-400 text-xs">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>Lowering thresholds below 50% will increase False Positives from telemetry scans.</span>
                </div>
              </div>
            </div>

            {/* AI Settings / Secrets */}
            <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  AI Model API Credentials
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verify or overwrite LLM models and telemetry connectors.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full h-10 rounded-lg border bg-background/50 pl-3 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/30 font-mono"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="telemetry"
                    type="checkbox"
                    checked={telemetryEnabled}
                    onChange={(e) => setTelemetryEnabled(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-primary/30 text-primary focus:ring-primary bg-background cursor-pointer"
                  />
                  <label htmlFor="telemetry" className="text-xs text-muted-foreground cursor-pointer select-none">
                    Enable OpenTelemetry Tracing (Jaeger metrics export)
                  </label>
                </div>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </AppShell>
  )
}
