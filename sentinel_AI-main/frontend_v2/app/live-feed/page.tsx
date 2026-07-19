"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Radio, Play, Pause, Search, Filter, ShieldAlert,
  Download, Terminal, AlertTriangle, ShieldCheck, RefreshCw,
  Cpu, HardDrive, Network
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"

interface LogEvent {
  id: string
  timestamp: string
  sourceIp: string
  targetServer: string
  category: "Authentication" | "Network Scan" | "Ransomware" | "Phishing" | "SQL Injection"
  severity: "critical" | "high" | "medium" | "low"
  message: string
  status: "BLOCKED" | "CONTAINED" | "MONITORED"
}

const INITIAL_LOGS: LogEvent[] = [
  {
    id: "log-1",
    timestamp: "23:05:12.450",
    sourceIp: "185.220.101.45",
    targetServer: "db-master.internal",
    category: "SQL Injection",
    severity: "critical",
    message: "SQL signature matched: 'UNION SELECT username, password' on users endpoint.",
    status: "BLOCKED",
  },
  {
    id: "log-2",
    timestamp: "23:04:58.212",
    sourceIp: "103.220.45.92",
    targetServer: "auth-gateway.sentinel",
    category: "Authentication",
    severity: "high",
    message: "Brute force pattern: 15 failed logins within 60s from single gateway.",
    status: "CONTAINED",
  },
  {
    id: "log-3",
    timestamp: "23:04:30.980",
    sourceIp: "192.168.1.155",
    targetServer: "workstation-office.corp",
    category: "Ransomware",
    severity: "critical",
    message: "Rapid file modification matching Crypter payload extension sequence.",
    status: "CONTAINED",
  },
  {
    id: "log-4",
    timestamp: "23:03:15.110",
    sourceIp: "103.5.211.4",
    targetServer: "mail-delivery.intern",
    category: "Phishing",
    severity: "medium",
    message: "Email parsed with spoofed SPF header matching external routing profile.",
    status: "BLOCKED",
  },
  {
    id: "log-5",
    timestamp: "23:02:40.560",
    sourceIp: "84.12.93.15",
    targetServer: "api-gateway-v2.dmz",
    category: "Network Scan",
    severity: "low",
    message: "Port probe sweep detected on TCP ranges [22, 80, 443, 8080, 27017].",
    status: "MONITORED",
  },
]

export default function LiveFeedPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLive, setIsLive] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [logs, setLogs] = React.useState<LogEvent[]>(INITIAL_LOGS)
  const [severityFilter, setSeverityFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Simulate real-time logs updating
  React.useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const ips = ["192.112.5.4", "103.44.11.2", "84.12.93.15", "115.80.24.11", "103.5.211.4"]
      const servers = ["auth-gateway.sentinel", "db-master.internal", "api-gateway-v2.dmz", "mail-delivery.intern", "workstation-office.corp"]
      const categories = ["Authentication", "Network Scan", "Ransomware", "Phishing", "SQL Injection"] as const
      const severities = ["critical", "high", "medium", "low"] as const
      const statuses = ["BLOCKED", "CONTAINED", "MONITORED"] as const
      const messages = {
        "SQL Injection": "Signature match detected: malicious string manipulation attempt.",
        "Authentication": "Multiple logins from unrecognized geographic location.",
        "Ransomware": "Unusual volume of directory encryption operations.",
        "Phishing": "Inbound attachment flagged with high entropy malware signature.",
        "Network Scan": "Horizontal port scanning activity mapped to single host.",
      }

      const category = categories[Math.floor(Math.random() * categories.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const now = new Date()
      const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`

      const newLog: LogEvent = {
        id: `log-${Date.now()}`,
        timestamp,
        sourceIp: ips[Math.floor(Math.random() * ips.length)],
        targetServer: servers[Math.floor(Math.random() * servers.length)],
        category,
        severity,
        message: messages[category],
        status,
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 49)]) // Keep last 50 logs
    }, 2500)

    return () => clearInterval(interval)
  }, [isLive])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.sourceIp.toLowerCase().includes(search.toLowerCase()) ||
      log.targetServer.toLowerCase().includes(search.toLowerCase()) ||
      log.message.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    return matchesSearch && matchesSeverity && matchesCategory
  })

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BLOCKED":
        return <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
      case "CONTAINED":
        return <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
      default:
        return <Terminal className="w-3.5 h-3.5 text-cyan-400" />
    }
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
              <Radio className="w-6 h-6 text-primary animate-pulse" />
              Live Telemetry Feed
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Real-time parsing of system, authentication, and packet anomalies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isLive
                  ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_15px_rgba(0,255,255,0.15)]"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {isLive ? (
                <>
                  <Play className="w-3.5 h-3.5 animate-pulse" />
                  Live Streaming
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Feed Paused
                </>
              )}
            </button>
            <button
              onClick={() => {
                setLogs(INITIAL_LOGS)
                setSearch("")
                setSeverityFilter("all")
                setCategoryFilter("all")
              }}
              className="p-1.5 rounded-lg border bg-background/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Reset Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* System Health / Status Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-card/50 backdrop-blur-md p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Processor Intake</p>
              <h3 className="text-lg font-bold font-mono">1.25M EPS</h3>
            </div>
          </div>
          <div className="rounded-xl border bg-card/50 backdrop-blur-md p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Connectors</p>
              <h3 className="text-lg font-bold font-mono">12 Cloud Streams</h3>
            </div>
          </div>
          <div className="rounded-xl border bg-card/50 backdrop-blur-md p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Buffer Cache Status</p>
              <h3 className="text-lg font-bold font-mono">0.03% (Optimized)</h3>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border bg-card/40 backdrop-blur-md">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by IP, server, or log message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full h-10 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 font-mono"
            />
          </div>
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-3 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus-visible:outline-none border-none text-foreground cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Authentication">Authentication</option>
              <option value="Network Scan">Network Scan</option>
              <option value="Ransomware">Ransomware</option>
              <option value="Phishing">Phishing</option>
              <option value="SQL Injection">SQL Injection</option>
            </select>
          </div>
          {/* Severity Filter */}
          <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-3 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus-visible:outline-none border-none text-foreground cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Live Logs Stream Console */}
        <div className="rounded-xl border bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
          {/* Console Header */}
          <div className="bg-muted/40 border-b px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-foreground uppercase">
                INTELLIGENCE INGESTION ENGINE
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              PARSING PROTOCOL: Syslog/CEF v2
            </span>
          </div>

          {/* Console Body */}
          <div className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-primary/20 max-h-[600px]">
            <AnimatePresence initial={false}>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-all flex flex-col md:flex-row justify-between gap-3 items-start md:items-center"
                  >
                    <div className="flex flex-wrap gap-2 items-center flex-1">
                      <span className="text-primary font-bold">{log.timestamp}</span>
                      <Badge className={`border text-[9px] uppercase tracking-wider font-semibold ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </Badge>
                      <span className="text-muted-foreground/60">[ {log.category} ]</span>
                      <span className="text-amber-300 font-semibold">{log.sourceIp}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-emerald-300 font-semibold">{log.targetServer}</span>
                      <span className="text-foreground border-l border-muted/50 pl-2 ml-1 line-clamp-1 md:line-clamp-none">
                        {log.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      {getStatusIcon(log.status)}
                      <span className={`text-[10px] font-bold ${log.status === "BLOCKED" ? "text-green-400" : log.status === "CONTAINED" ? "text-orange-400" : "text-cyan-400"}`}>
                        {log.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldCheck className="w-10 h-10 text-primary/30 mb-2" />
                  <p>No active anomalies found in this stream interval</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AppShell>
  )
}
