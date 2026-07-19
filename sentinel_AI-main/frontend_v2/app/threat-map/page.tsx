"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin, AlertTriangle, ShieldCheck, Flame, Radio,
  Filter, Play, Pause, RefreshCw, BarChart2, ShieldAlert
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"

interface ThreatEvent {
  id: string
  source: string
  target: string
  sourceCoords: { x: number; y: number }
  targetCoords: { x: number; y: number }
  type: "Phishing" | "UPI Fraud" | "Ransomware" | "Identity Theft"
  severity: "critical" | "high" | "medium" | "low"
  timestamp: string
  status: "blocked" | "investigating" | "contained"
}

const MAP_HUBS = [
  { name: "New Delhi", x: 230, y: 150, ip: "103.45.12.8", activeIncidents: 45, status: "High Alert" },
  { name: "Mumbai", x: 180, y: 310, ip: "115.80.24.11", activeIncidents: 62, status: "Critical" },
  { name: "Bengaluru", x: 220, y: 400, ip: "103.220.45.92", activeIncidents: 89, status: "Active Attack" },
  { name: "Chennai", x: 250, y: 410, ip: "122.180.15.5", activeIncidents: 28, status: "Stable" },
  { name: "Kolkata", x: 380, y: 220, ip: "103.5.211.4", activeIncidents: 34, status: "Monitored" },
  { name: "Hyderabad", x: 240, y: 340, ip: "115.110.60.3", activeIncidents: 41, status: "Contained" },
]

const INITIAL_EVENTS: ThreatEvent[] = [
  {
    id: "evt-1",
    source: "External IP (192.112.5.4)",
    target: "Bengaluru Command Hub",
    sourceCoords: { x: 50, y: 250 },
    targetCoords: { x: 220, y: 400 },
    type: "Ransomware",
    severity: "critical",
    timestamp: "Just Now",
    status: "investigating",
  },
  {
    id: "evt-2",
    source: "Rogue ISP (103.44.11.2)",
    target: "New Delhi Server",
    sourceCoords: { x: 80, y: 80 },
    targetCoords: { x: 230, y: 150 },
    type: "Phishing",
    severity: "high",
    timestamp: "1m ago",
    status: "blocked",
  },
  {
    id: "evt-3",
    source: "Suspect Wallet (VPA: mule@upi)",
    target: "Mumbai Node",
    sourceCoords: { x: 100, y: 350 },
    targetCoords: { x: 180, y: 310 },
    type: "UPI Fraud",
    severity: "critical",
    timestamp: "3m ago",
    status: "contained",
  },
  {
    id: "evt-4",
    source: "Darknet Node (84.12.93.15)",
    target: "Kolkata Hub",
    sourceCoords: { x: 450, y: 150 },
    targetCoords: { x: 380, y: 220 },
    type: "Identity Theft",
    severity: "medium",
    timestamp: "5m ago",
    status: "blocked",
  },
]

export default function ThreatMapPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLive, setIsLive] = React.useState(true)
  const [selectedHub, setSelectedHub] = React.useState<typeof MAP_HUBS[0] | null>(null)
  const [events, setEvents] = React.useState<ThreatEvent[]>(INITIAL_EVENTS)
  const [filterType, setFilterType] = React.useState<string>("all")
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all")
  const [activeArcs, setActiveArcs] = React.useState<ThreatEvent[]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  // Simulate incoming live attacks when active
  React.useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const sourceHubs = [
        { name: "External Node (US)", x: 40, y: 100 },
        { name: "SaaS IP (Europe)", x: 50, y: 320 },
        { name: "Proxy IP (China)", x: 450, y: 80 },
        { name: "VPN Server (Russia)", x: 420, y: 390 },
      ]
      const targetHub = MAP_HUBS[Math.floor(Math.random() * MAP_HUBS.length)]
      const source = sourceHubs[Math.floor(Math.random() * sourceHubs.length)]
      
      const types = ["Phishing", "UPI Fraud", "Ransomware", "Identity Theft"] as const
      const severities = ["critical", "high", "medium", "low"] as const
      const statuses = ["blocked", "investigating", "contained"] as const

      const newEvent: ThreatEvent = {
        id: `evt-${Date.now()}`,
        source: source.name,
        target: targetHub.name,
        sourceCoords: { x: source.x, y: source.y },
        targetCoords: { x: targetHub.x, y: targetHub.y },
        type: types[Math.floor(Math.random() * types.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        timestamp: "Just Now",
        status: statuses[Math.floor(Math.random() * statuses.length)],
      }

      setEvents(prev => [newEvent, ...prev.slice(0, 15)])
      setActiveArcs(prev => [...prev, newEvent])

      // Remove active arc visual after animation duration (2 seconds)
      setTimeout(() => {
        setActiveArcs(prev => prev.filter(arc => arc.id !== newEvent.id))
      }, 2000)

    }, 3500)

    return () => clearInterval(interval)
  }, [isLive])

  const filteredEvents = events.filter(e => {
    if (filterType !== "all" && e.type !== filterType) return false
    if (filterSeverity !== "all" && e.severity !== filterSeverity) return false
    return true
  })

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
              <Flame className="w-6 h-6 text-red-500 animate-pulse" />
              Global Threat Map
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Real-time regional attack trajectory and geographical telemetry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                isLive
                  ? "bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {isLive ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Live Stream Active
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  Stream Paused
                </>
              )}
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visual Map Card */}
          <div className="lg:col-span-2 rounded-xl border bg-card/50 backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            {/* Cybersecurity Radar/Grid Background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#00ffff_1px,transparent_1px),linear-gradient(to_bottom,#00ffff_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="absolute inset-0 bg-radial-gradient-glow opacity-5" />

            {/* Map Header Controls */}
            <div className="flex justify-between items-center z-10 relative">
              <span className="text-xs font-mono font-semibold tracking-wider text-primary/70 uppercase">
                Interactive Geospatial Telemetry
              </span>
              <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus-visible:outline-none border-none text-foreground cursor-pointer"
                >
                  <option value="all">All Attacks</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="UPI Fraud">UPI Fraud</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Identity Theft">Identity Theft</option>
                </select>
              </div>
            </div>

            {/* Interactive SVG Threat Map */}
            <div className="flex-1 flex items-center justify-center py-6 relative z-10">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 500 500"
                className="max-w-[450px] max-h-[450px] drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              >
                {/* Abstract India Map Outline (Schematic polygon path approximation for high tech feel) */}
                <path
                  d="M230 40 L270 90 L290 120 L310 150 L340 180 L390 200 L400 230 L360 250 L350 280 L300 320 L270 380 L260 450 L240 460 L230 420 L220 380 L180 340 L160 300 L140 280 L150 250 L180 200 L190 170 L210 120 Z"
                  fill="rgba(6, 182, 212, 0.03)"
                  stroke="rgba(6, 182, 212, 0.15)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Grid Gridlines (Diagonal scanlines) */}
                <line x1="0" y1="0" x2="500" y2="500" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="1" />
                <line x1="500" y1="0" x2="0" y2="500" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="1" />

                {/* Animated Attack Path Arcs */}
                <AnimatePresence>
                  {activeArcs.map((arc) => (
                    <g key={arc.id}>
                      {/* Attack path arc */}
                      <motion.path
                        d={`M ${arc.sourceCoords.x} ${arc.sourceCoords.y} Q ${(arc.sourceCoords.x + arc.targetCoords.x) / 2} ${(arc.sourceCoords.y + arc.targetCoords.y) / 2 - 40} ${arc.targetCoords.x} ${arc.targetCoords.y}`}
                        fill="none"
                        stroke={arc.severity === "critical" ? "#ef4444" : "#f59e0b"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 1 }}
                        animate={{ pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />
                      {/* Pulsing signal on path */}
                      <motion.circle
                        r="3"
                        fill="#06b6d4"
                        initial={{ offset: 0 }}
                        animate={{
                          cx: [arc.sourceCoords.x, arc.targetCoords.x],
                          cy: [arc.sourceCoords.y, arc.targetCoords.y]
                        }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                      />
                    </g>
                  ))}
                </AnimatePresence>

                {/* External threat nodes (source of packets) */}
                <g>
                  <circle cx="40" cy="100" r="4" fill="rgba(239, 68, 68, 0.4)" />
                  <circle cx="50" cy="320" r="4" fill="rgba(239, 68, 68, 0.4)" />
                  <circle cx="450" cy="80" r="4" fill="rgba(239, 68, 68, 0.4)" />
                  <circle cx="420" cy="390" r="4" fill="rgba(239, 68, 68, 0.4)" />
                </g>

                {/* Command Center Hubs */}
                {MAP_HUBS.map((hub) => {
                  const isSelected = selectedHub?.name === hub.name
                  const isActiveTarget = activeArcs.some(arc => arc.target === hub.name)
                  return (
                    <g
                      key={hub.name}
                      onClick={() => setSelectedHub(hub)}
                      className="cursor-pointer group"
                    >
                      {/* Outer pulsing ring */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isSelected ? 16 : 10}
                        fill="none"
                        stroke={isActiveTarget ? "#ef4444" : "#06b6d4"}
                        strokeWidth="1.5"
                        className={isActiveTarget ? "animate-ping" : "group-hover:scale-125 transition-transform"}
                        style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
                      />
                      {/* Core node dot */}
                      <circle
                        cx={hub.x}
                        cy={hub.y}
                        r={isSelected ? 6 : 4}
                        fill={isActiveTarget ? "#ef4444" : "#06b6d4"}
                        className="group-hover:fill-cyan-300 transition-colors"
                      />
                      {/* Pulse circle for critical nodes */}
                      {hub.status === "Critical" && (
                        <circle
                          cx={hub.x}
                          cy={hub.y}
                          r="22"
                          fill="none"
                          stroke="rgba(239, 68, 68, 0.2)"
                          strokeWidth="1"
                          className="animate-pulse"
                        />
                      )}
                      {/* Tooltip labels */}
                      <text
                        x={hub.x + 10}
                        y={hub.y + 4}
                        fill="white"
                        fontSize="9"
                        fontWeight="semibold"
                        className="opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-mono"
                      >
                        {hub.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Selected Hub Details Sub-Panel */}
            <AnimatePresence mode="wait">
              {selectedHub ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-background/90 border border-primary/20 rounded-lg p-3 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 relative"
                >
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      {selectedHub.name} Hub
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      Telemetry Node IP: {selectedHub.ip}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Active Alerts</span>
                      <span className="font-bold text-foreground">{selectedHub.activeIncidents} Cases</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Node Status</span>
                      <Badge className={selectedHub.status === "Critical" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"}>
                        {selectedHub.status}
                      </Badge>
                    </div>
                    <button
                      onClick={() => setSelectedHub(null)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-[11px] text-muted-foreground/60 font-mono text-center z-10 border-t border-primary/10 pt-3">
                  Click on any map hub node to inspect local cyber command stats.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Telemetry Alerts Stream */}
          <div className="rounded-xl border bg-card/50 backdrop-blur-md p-6 flex flex-col justify-between max-h-[500px]">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400 animate-pulse" />
                Live Cyber Telemetry
              </span>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-mono text-[9px]">
                {filteredEvents.length} Active Stream
              </Badge>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-primary/20">
              {filteredEvents.length > 0 ? (
                <AnimatePresence initial={false}>
                  {filteredEvents.map((evt) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3 rounded-lg border bg-background/50 hover:border-primary/20 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-mono block">SOURCE</span>
                          <span className="text-xs font-semibold text-foreground truncate max-w-[150px] block">{evt.source}</span>
                        </div>
                        <Badge
                          className={
                            evt.severity === "critical"
                              ? "bg-red-500/15 text-red-400 border-red-500/30 text-[9px]"
                              : evt.severity === "high"
                              ? "bg-orange-500/15 text-orange-400 border-orange-500/30 text-[9px]"
                              : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30 text-[9px]"
                          }
                        >
                          {evt.severity}
                        </Badge>
                      </div>

                      <div className="text-xs font-bold text-foreground">
                        Vector: {evt.type}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-muted/30 pt-1.5">
                        <span className="font-mono">{evt.timestamp}</span>
                        <span className="flex items-center gap-1">
                          {evt.status === "blocked" ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 font-semibold font-mono">BLOCKED</span>
                            </>
                          ) : evt.status === "contained" ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="text-cyan-400 font-semibold font-mono">CONTAINED</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                              <span className="text-yellow-400 font-semibold font-mono">INVESTIGATING</span>
                            </>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <ShieldCheck className="w-10 h-10 text-primary/40 mb-2" />
                  <p className="text-xs font-semibold">No telemetry matches criteria</p>
                  <p className="text-[10px] text-muted-foreground/60">Adjust active search filter options.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </motion.div>
    </AppShell>
  )
}
