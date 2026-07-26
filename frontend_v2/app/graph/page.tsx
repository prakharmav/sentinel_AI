"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ZoomIn, ZoomOut, Maximize2, Play, Pause, Calendar } from "lucide-react"

// Layout components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// Design system graph primitives
import { GraphControls, NodeDetailSideSheet, EdgePanel, GraphLegend } from "@/components/graph"
import { FilterPanel } from "@/components/analytics"

// UI components
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Node {
  id: string
  label: string
  type: "Entity" | "Account" | "IP" | "Phone" | "Case"
  x: number
  y: number
  details: Record<string, string | number>
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
  amount?: string | number
  timestamp?: string
}

const legendItems = [
  { type: "Entity", color: "#EF4444" },
  { type: "Account", color: "#F59E0B" },
  { type: "IP", color: "#3B82F6" },
  { type: "Phone", color: "#10B981" },
  { type: "Case", color: "#8B5CF6" },
]

const initialNodes: Node[] = [
  { id: "node_1", label: "Amit Sharma (Suspect)", type: "Entity", x: 150, y: 100, details: { phone: "+91 98765 43210", email: "amit.sharma@protonmail.com", status: "Critical Risk" } },
  { id: "node_2", label: "ICICI Bank - ACC-8204", type: "Account", x: 250, y: 180, details: { account_number: "ICICI-0028402", balance: "₹14,50,000", branch: "Vasanthnagar, Bangalore" } },
  { id: "node_3", label: "IP 192.168.1.104", type: "IP", x: 350, y: 100, details: { isp: "Reliance Jio", location: "Bangalore, India", usage: "VPN Tunnel Detected" } },
  { id: "node_4", label: "Phone +91 99999 88888", type: "Phone", x: 120, y: 240, details: { carrier: "Airtel", owner: "Unknown Alias", status: "Active Spoofing" } },
  { id: "node_5", label: "Case #FIR-2026-48", type: "Case", x: 320, y: 240, details: { incident_type: "Financial Fraud", filing_date: "12-07-2026", status: "Investigating" } },
]

const initialEdges: Edge[] = [
  { id: "edge_12", source: "node_1", target: "node_2", type: "TRANSFERRED_FUNDS", amount: "₹14,50,000", timestamp: "10-07-2026" },
  { id: "edge_23", source: "node_2", target: "node_3", type: "ACCESSED_FROM", timestamp: "11-07-2026" },
  { id: "edge_14", source: "node_1", target: "node_4", type: "REGISTERED_PHONE", timestamp: "08-07-2026" },
  { id: "edge_25", source: "node_2", target: "node_5", type: "LINKED_EVIDENCE", timestamp: "12-07-2026" },
]

const filterGroups = [
  {
    id: "node_type",
    title: "Node Filters",
    options: [
      { label: "Entity (Suspects)", value: "Entity" },
      { label: "Accounts", value: "Account" },
      { label: "IP Addresses", value: "IP" },
      { label: "Phone Numbers", value: "Phone" },
      { label: "Cases", value: "Case" },
    ],
  },
]

export default function GraphPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes)
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges)
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFilters, setSelectedFilters] = React.useState({ node_type: [] as string[] })
  
  // Interactive Viewport States
  const [zoom, setZoom] = React.useState(1)
  const [isLayoutPaused, setIsLayoutPaused] = React.useState(false)
  const [timelineVal, setTimelineVal] = React.useState(100)
  
  // Selected Graph Node / Edge details
  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = (groupId: string, value: string) => {
    const current = selectedFilters.node_type
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setSelectedFilters({ node_type: updated })
  }

  // Filter nodes based on type check and search queries
  const filteredNodes = nodes.filter((node) => {
    const matchesFilter = selectedFilters.node_type.length === 0 || selectedFilters.node_type.includes(node.type)
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Filter edges so we only draw lines where both source and target nodes exist in the current viewport
  const visibleEdges = edges.filter((edge) => {
    const sourceExists = filteredNodes.some((n) => n.id === edge.source)
    const targetExists = filteredNodes.some((n) => n.id === edge.target)
    return sourceExists && targetExists
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
        className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]"
      >
        {/* Left Control Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          
          {/* Node Category Filters */}
          <FilterPanel
            groups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={() => setSelectedFilters({ node_type: [] })}
          />

          {/* Time Scrubber Timeline */}
          <div className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Timeline Scrubber</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Historical Logs</span>
                <span className="font-semibold text-foreground">100% Data Visible</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={timelineVal}
                onChange={(e) => setTimelineVal(Number(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>08-07-2026</span>
                <span>12-07-2026</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Graph Viewport Workspace */}
        <main className="flex-1 border rounded-xl bg-card relative overflow-hidden flex flex-col">
          
          {/* Top Canvas Controls Panel */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 border-b bg-card z-10 shrink-0">
            <div className="flex items-center gap-2 w-full sm:max-w-xs">
              <Input
                type="text"
                placeholder="Search nodes in network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs focus-ring bg-background"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Dynamic SVG Interactive Viewport Canvas */}
          <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/5 to-background">
            <svg className="w-full h-full">
              <g transform={`scale(${zoom})`} className="transition-transform duration-300 ease-out">
                {/* Edges - Connection Lines */}
                {visibleEdges.map((edge) => {
                  const sourceNode = filteredNodes.find((n) => n.id === edge.source)
                  const targetNode = filteredNodes.find((n) => n.id === edge.target)
                  if (!sourceNode || !targetNode) return null

                  const isSelected = selectedEdge?.id === edge.id

                  return (
                    <g key={edge.id} className="cursor-pointer" onClick={() => { setSelectedEdge(edge); setSelectedNode(null) }}>
                      <line
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        strokeWidth={isSelected ? "2.5" : "1.2"}
                        strokeOpacity={isSelected ? "1" : "0.4"}
                        strokeDasharray={edge.type === "LINKED_EVIDENCE" ? "4 3" : undefined}
                        className="transition-all"
                      />
                      {/* Midpoint relation type text labels */}
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2 - 5}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[7px] text-muted-foreground/80 font-bold tracking-wider select-none bg-background pointer-events-none"
                      >
                        {edge.type}
                      </text>
                    </g>
                  )
                })}

                {/* Nodes - Circles/Avatars */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id
                  const nodeColor = legendItems.find((li) => li.type === node.type)?.color || "#ffffff"

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer group"
                      onClick={() => { setSelectedNode(node); setSelectedEdge(null) }}
                      transform={`translate(${node.x}, ${node.y})`}
                    >
                      {/* Interactive hover circle */}
                      <circle
                        r="18"
                        fill="transparent"
                        stroke={isSelected ? "hsl(var(--primary))" : "transparent"}
                        strokeWidth="1.5"
                        className="transition-all scale-[1.2]"
                      />
                      <circle
                        r="10"
                        fill={nodeColor}
                        stroke="hsl(var(--card))"
                        strokeWidth="2"
                        className="transition-all shadow-md group-hover:scale-110"
                      />
                      <text
                        y="22"
                        textAnchor="middle"
                        fill="currentColor"
                        className={cn("text-[9px] font-bold select-none", isSelected ? "text-primary" : "text-foreground")}
                      >
                        {node.label.split(" (")[0]}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>

            {/* Overlays: Controls */}
            <GraphControls
              onZoomIn={() => setZoom((z) => Math.min(z + 0.15, 2))}
              onZoomOut={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
              onFitScreen={() => setZoom(1)}
              isLayoutPaused={isLayoutPaused}
              onToggleLayout={() => setIsLayoutPaused(!isLayoutPaused)}
              className="absolute top-4 left-4 z-20"
            />

            {/* Overlays: Relationship Edge detail box */}
            <EdgePanel edge={selectedEdge} onClose={() => setSelectedEdge(null)} />

            {/* Overlays: Map Legend index */}
            <GraphLegend items={legendItems} className="absolute bottom-4 right-4 z-20" />

            {/* Overlays: Minimap Radar Panel */}
            <div className="absolute top-4 right-4 z-20 border rounded-lg bg-popover/80 backdrop-blur-xs p-1.5 w-24 h-24 hidden sm:block pointer-events-none opacity-80" aria-hidden="true">
              <span className="text-[7px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Minimap</span>
              <div className="relative w-full h-[calc(100%-10px)] bg-black/10 dark:bg-white/5 border border-dashed rounded flex items-center justify-center">
                {/* Replicated smaller dots */}
                {filteredNodes.map((n) => (
                  <div
                    key={n.id}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                      left: `${(n.x / 450) * 100}%`,
                      top: `${(n.y / 300) * 100}%`,
                      backgroundColor: legendItems.find((li) => li.type === n.type)?.color || "#fff",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overlays: Side Detail panel */}
          <NodeDetailSideSheet node={selectedNode} onClose={() => setSelectedNode(null)} />

        </main>
      </motion.div>
    </AppShell>
  )
}
