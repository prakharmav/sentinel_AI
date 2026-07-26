"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ShieldAlert, Activity, ShieldCheck, Zap,
  AlertOctagon, FileText, BrainCircuit, Share2,
  Calendar
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// Chart Components
import { BarChart, LineChart, AreaChart, PieChart, HeatMap, TrendChart, PredictionChart, KPIChart } from "@/components/charts"

// Dashboard Card Components
import { StatCard, MetricCard, AlertCard, CrimeCard, ActivityCard, AIInsightCard, PredictionCard, QuickActionCard } from "@/components/dashboard"

// Shared and UI components
import { Badge } from "@/components/ui/badge"

const severityTrendData = [
  { label: "00:00", value: 12 },
  { label: "04:00", value: 18 },
  { label: "08:00", value: 35 },
  { label: "12:00", value: 48 },
  { label: "16:00", value: 24 },
  { label: "20:00", value: 15 },
]

const categoryDistribution = [
  { label: "Financial Fraud", value: 45 },
  { label: "Cyber Bullying", value: 25 },
  { label: "Phishing", value: 20 },
  { label: "Identity Theft", value: 10 },
]

const recentIncidents = [
  {
    title: "Phishing attack on local registry office",
    category: "Phishing",
    location: "Sector 4, New Delhi",
    timestamp: "10 mins ago",
    status: "open" as const,
    severity: "high" as const,
  },
  {
    title: "Unusual money trail in cooperative bank",
    category: "Financial Fraud",
    location: "Vasanthnagar, Bangalore",
    timestamp: "24 mins ago",
    status: "investigating" as const,
    severity: "critical" as const,
  },
  {
    title: "Cyber harassment incident logged",
    category: "Cyber Bullying",
    location: "Mysore Road, Mysore",
    timestamp: "1 hour ago",
    status: "resolved" as const,
    severity: "low" as const,
  },
]

const recentAlerts = [
  {
    title: "Critical Database Anomaly",
    description: "Multiple failed root logins detected from unauthorized external IP addresses.",
    timestamp: "2m ago",
    severity: "critical" as const,
  },
  {
    title: "Unusual Transfer Pattern",
    description: "AI model flagged transaction correlation matching fraud ring template #4.",
    timestamp: "15m ago",
    severity: "high" as const,
  },
]

const heatmapData = [
  { x: "Mon", y: "Sector A", value: 15 },
  { x: "Tue", y: "Sector A", value: 25 },
  { x: "Wed", y: "Sector A", value: 5 },
  { x: "Thu", y: "Sector A", value: 40 },
  { x: "Fri", y: "Sector A", value: 10 },
  { x: "Mon", y: "Sector B", value: 50 },
  { x: "Tue", y: "Sector B", value: 12 },
  { x: "Wed", y: "Sector B", value: 28 },
  { x: "Thu", y: "Sector B", value: 8 },
  { x: "Fri", y: "Sector B", value: 34 },
  { x: "Mon", y: "Sector C", value: 8 },
  { x: "Tue", y: "Sector C", value: 45 },
  { x: "Wed", y: "Sector C", value: 15 },
  { x: "Thu", y: "Sector C", value: 22 },
  { x: "Fri", y: "Sector C", value: 5 },
]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SOC Command Center</h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              Autonomous threat detection and cyber telemetry analytics
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border">
            <Calendar className="w-3.5 h-3.5" />
            <span>Real-time Sync Active</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            label="Trigger SOS Dispatch"
            description="Initiate local cyber response protocols"
            icon={<AlertOctagon className="w-4 h-4" />}
            onClick={() => alert("SOS Dispatch Initiated")}
            className="border-red-500/10 hover:border-red-500/30"
          />
          <QuickActionCard
            label="Log New Case / FIR"
            description="Create official NCRB digital record"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => alert("Redirecting to FIR filing form...")}
          />
          <QuickActionCard
            label="Run Threat Scan"
            description="Initiate deep telemetry query analysis"
            icon={<BrainCircuit className="w-4 h-4" />}
            onClick={() => alert("Scanning backend telemetry...")}
          />
          <QuickActionCard
            label="View Fraud Network"
            description="Access Neo4j money trails visualization"
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => alert("Loading Graph Database Visualization...")}
          />
        </div>

        {/* Key Performance Indicators (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Incident Records"
            value="43"
            change={12}
            changeLabel="from last hour"
            icon={<ShieldAlert className="w-4 h-4" />}
          />
          <KPIChart
            label="Average System Latency"
            value="142ms"
            change={-15}
            changeLabel="response latency drop"
            icon={<Zap className="w-4 h-4 text-primary" />}
          />
          <MetricCard
            label="Solved Cyber Incidents"
            value="89%"
            subtitle="Case resolution target: 95%"
            progress={89}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
          />
          <StatCard
            label="Identified Fraud Rings"
            value="7"
            change={0}
            changeLabel="no new rings flagged"
            icon={<Activity className="w-4 h-4" />}
          />
        </div>

        {/* Master Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualizations Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Chart */}
            <AreaChart
              data={severityTrendData}
              title="Threat Intensity Index (24 Hours)"
              subtitle="Consolidated metric tracking threat frequency and impact scores over time."
            />

            {/* Heatmap Section */}
            <HeatMap
              data={heatmapData}
              title="Regional Threat Density Heatmap"
              subtitle="Spatial risk index distribution calculated by location and incident category."
            />

            {/* Incident logs */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-foreground">Recent Incidents Log</h3>
                <Badge variant="outline">Live Feed</Badge>
              </div>
              <div className="space-y-3">
                {recentIncidents.map((incident, i) => (
                  <CrimeCard
                    key={i}
                    title={incident.title}
                    category={incident.category}
                    location={incident.location}
                    timestamp={incident.timestamp}
                    status={incident.status}
                    severity={incident.severity}
                    onClick={() => alert(`Opening incident details for: ${incident.title}`)}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Side Panels Column */}
          <div className="space-y-6">
            
            {/* AI Insights Engine Widget */}
            <AIInsightCard
              title="AI SOC Telemetry Analyzer"
              insight="Highly unusual transaction clustering pattern matching shell company templates flagged in Bangalore Sector 4. Recommend immediate Graph Network tracing."
              confidence={94}
              model="SentinelAI-v2.0"
              timestamp="5m ago"
              tags={["Clustering", "Fraud Ring"]}
            />

            {/* Stat Sparklines */}
            <TrendChart
              data={[
                { label: "Mon", value: 12 },
                { label: "Tue", value: 19 },
                { label: "Wed", value: 10 },
                { label: "Thu", value: 25 },
                { label: "Fri", value: 45 },
              ]}
              title="Incoming Alert Telemetry"
              subtitle="Daily volume comparison tracking active security alerts."
              trend="up"
              trendLabel="+24% today"
            />

            {/* Alert List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Critical Incident Stream</h3>
              <div className="space-y-3">
                {recentAlerts.map((alert, i) => (
                  <AlertCard
                    key={i}
                    title={alert.title}
                    description={alert.description}
                    timestamp={alert.timestamp}
                    severity={alert.severity}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </AppShell>
  )
}
