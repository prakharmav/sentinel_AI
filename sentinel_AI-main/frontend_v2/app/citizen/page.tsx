"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, AlertOctagon, HelpCircle, PhoneCall, CheckCircle,
  Clock, Search, ShieldCheck, HelpCircle as HelpIcon, MapPin,
  Mic, Send, ArrowRight, Loader2
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"
import { SOSButton, VoiceRecorder, IncidentForm } from "@/components/citizen"

export default function CitizenPortalPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [scanQuery, setScanQuery] = React.useState("")
  const [scanResult, setScanResult] = React.useState<{
    scanned: string
    riskScore: number
    status: "clean" | "suspicious" | "blacklisted"
    message: string
  } | null>(null)
  const [isScanning, setIsScanning] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleScan = () => {
    if (!scanQuery.trim()) return
    setIsScanning(true)
    setScanResult(null)

    setTimeout(() => {
      setIsScanning(false)
      const query = scanQuery.toLowerCase().trim()
      if (query.includes("mule") || query.includes("9988776655") || query.includes("fake")) {
        setScanResult({
          scanned: scanQuery,
          riskScore: 0.94,
          status: "blacklisted",
          message: "Warning: Flagged in 4 active money-mule investigations. Immediately cancel interactions.",
        })
      } else {
        setScanResult({
          scanned: scanQuery,
          riskScore: 0.12,
          status: "clean",
          message: "No matches found in active threat databases. Exercise normal caution.",
        })
      }
    }, 1500)
  }

  const handleVoiceRecording = (audioUrl: string) => {
    alert(`Voice complaint received: ${audioUrl}. Parsing audio with Gemini API...`)
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
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Citizen Safety Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Verify suspect endpoints, file emergency reports, and contact support
            </p>
          </div>
        </div>

        {/* SOS Emergency Dispatch Button */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SOS Trigger Card */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 flex flex-col justify-between items-center text-center gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center justify-center gap-1.5">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
                Emergency SOS Trigger
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                One-click dispatch of cybersecurity response and local precinct dispatch alerts.
              </p>
            </div>
            <SOSButton onTrigger={() => {}} />
            <span className="text-[10px] text-muted-foreground font-mono">
              Note: Triggering logs coordinates and telemetry details automatically
            </span>
          </div>

          {/* Voice Complaint Intake */}
          <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Bilingual Voice Report
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Record your complaint. Our AI translates and drafts legal sections.
              </p>
            </div>
            <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
          </div>

          {/* Scam & Endpoint Scanner */}
          <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Scam Endpoint Scanner
              </h2>
              <p className="text-xs text-muted-foreground">
                Verify suspect UPI VPAs, phone numbers, or domain links.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. mule@upi or +91 9988776655"
                  value={scanQuery}
                  onChange={(e) => setScanQuery(e.target.value)}
                  className="flex-1 h-10 rounded-lg border bg-background/50 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-mono"
                />
                <button
                  onClick={handleScan}
                  disabled={isScanning || !scanQuery.trim()}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </button>
              </div>

              {/* Scan Result display */}
              <AnimatePresence mode="wait">
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      scanResult.status === "blacklisted"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-green-500/10 border-green-500/20 text-green-400"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Result: {scanResult.status.toUpperCase()}</span>
                      <span className="font-mono">Risk: {(scanResult.riskScore * 100).toFixed(0)}%</span>
                    </div>
                    <p className="leading-relaxed">{scanResult.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Structured Incident Form Portal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border bg-card/40 backdrop-blur-md p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
              Detailed Complaint Registration Form
            </h2>
            <IncidentForm onSubmit={(data) => alert(`Filing incident: ${JSON.stringify(data)}`)} />
          </div>

          {/* Interactive Help Guides */}
          <div className="rounded-xl border bg-card/40 backdrop-blur-md p-6 flex flex-col justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" />
              Resource Directory
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="p-3 rounded-lg border bg-background/30 hover:border-primary/20 transition-all text-xs">
                <strong className="text-foreground block">National Helpline</strong>
                <span className="text-muted-foreground">Dial 1930 for financial cyber frauds reporting desk.</span>
              </div>
              <div className="p-3 rounded-lg border bg-background/30 hover:border-primary/20 transition-all text-xs">
                <strong className="text-foreground block">DPDP Act Privacy Rights</strong>
                <span className="text-muted-foreground">Learn how to request data deletion under personal data protection guidelines.</span>
              </div>
              <div className="p-3 rounded-lg border bg-background/30 hover:border-primary/20 transition-all text-xs">
                <strong className="text-foreground block">Fraud Awareness FAQ</strong>
                <span className="text-muted-foreground">Read typical patterns of phishing, executive impersonations, and UPI cheats.</span>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </AppShell>
  )
}
