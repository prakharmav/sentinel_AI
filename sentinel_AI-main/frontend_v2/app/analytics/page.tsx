"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  Download, FileSpreadsheet, FileText, Calendar,
  TrendingUp, Activity, RefreshCw, BarChart2
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// Analytics Primitives
import { FilterPanel, DateRangePicker } from "@/components/analytics"

// Chart Components
import { BarChart, LineChart, AreaChart, PieChart, HeatMap, TrendChart, PredictionChart, KPIChart } from "@/components/charts"

// Dashboard / Card Components
import { StatCard, PredictionCard } from "@/components/dashboard"

// UI components
import { Button } from "@/components/ui/button"

const initialFilters = {
  category: [] as string[],
  severity: [] as string[],
}

const filterGroups = [
  {
    id: "category",
    title: "Category",
    options: [
      { label: "Financial Fraud", value: "financial" },
      { label: "Cyber Bullying", value: "harassment" },
      { label: "Phishing", value: "phishing" },
      { label: "Identity Theft", value: "identity" },
    ],
  },
  {
    id: "severity",
    title: "Severity Level",
    options: [
      { label: "Critical", value: "critical" },
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
  },
]

const threatTrendData = [
  { label: "00:00", value: 12 },
  { label: "04:00", value: 18 },
  { label: "08:00", value: 35 },
  { label: "12:00", value: 48 },
  { label: "16:00", value: 24 },
  { label: "20:00", value: 15 },
]

const districtComparisonData = [
  { label: "New Delhi", value: 145 },
  { label: "Bangalore", value: 210 },
  { label: "Mumbai", value: 185 },
  { label: "Chennai", value: 95 },
  { label: "Hyderabad", value: 110 },
]

const categoryDistribution = [
  { label: "Financial Fraud", value: 45 },
  { label: "Cyber Bullying", value: 25 },
  { label: "Phishing", value: 20 },
  { label: "Identity Theft", value: 10 },
]

const actualTrend = [
  { label: "W1", value: 80 },
  { label: "W2", value: 95 },
  { label: "W3", value: 110 },
  { label: "W4", value: 90 },
]

const predictedTrend = [
  { label: "W1", value: 82 },
  { label: "W2", value: 92 },
  { label: "W3", value: 105 },
  { label: "W4", value: 115 },
]

const heatmapData = [
  { x: "Delhi", y: "Mon", value: 15 },
  { x: "Delhi", y: "Tue", value: 25 },
  { x: "Delhi", y: "Wed", value: 5 },
  { x: "Delhi", y: "Thu", value: 40 },
  { x: "Delhi", y: "Fri", value: 10 },
  { x: "Bangalore", y: "Mon", value: 50 },
  { x: "Bangalore", y: "Tue", value: 12 },
  { x: "Bangalore", y: "Wed", value: 28 },
  { x: "Bangalore", y: "Thu", value: 8 },
  { x: "Bangalore", y: "Fri", value: 34 },
  { x: "Mumbai", y: "Mon", value: 8 },
  { x: "Mumbai", y: "Tue", value: 45 },
  { x: "Mumbai", y: "Wed", value: 15 },
  { x: "Mumbai", y: "Thu", value: 22 },
  { x: "Mumbai", y: "Fri", value: 5 },
]

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedFilters, setSelectedFilters] = React.useState(initialFilters)
  const [dateRange, setDateRange] = React.useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = (groupId: string, value: string) => {
    const current = selectedFilters[groupId as keyof typeof selectedFilters] || []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    
    setSelectedFilters({
      ...selectedFilters,
      [groupId]: updated,
    })
  }

  const handleClearAll = () => {
    setSelectedFilters(initialFilters)
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
        className="flex flex-col lg:flex-row gap-6"
      >
        {/* Left column: Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <FilterPanel
            groups={filterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
          />
        </aside>

        {/* Right column: Main Analytics */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Threat Analytics</h1>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                Consolidated District and Spatiotemporal Telemetry
              </p>
            </div>
            
            {/* Exports */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs focus-ring"
                onClick={() => alert("Compiling NCRB compliant PDF report...")}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-xs focus-ring"
                onClick={() => alert("Downloading clean telemetry CSV data...")}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Analyzed Incidents"
              value="745"
              change={8}
              changeLabel="increase vs past week"
              icon={<Activity className="w-4 h-4" />}
            />
            <StatCard
              label="Confidence Metric"
              value="92.4%"
              change={1.2}
              changeLabel="average classification rise"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <TrendChart
              data={[
                { label: "Mon", value: 12 },
                { label: "Tue", value: 19 },
                { label: "Wed", value: 10 },
                { label: "Thu", value: 25 },
                { label: "Fri", value: 45 },
              ]}
              title="Daily Incident Velocity"
              trend="up"
              trendLabel="+24%"
            />
          </div>

          {/* Telemetry Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Incident Trend */}
            <AreaChart
              data={threatTrendData}
              title="Incident Volume Trajectory"
              subtitle="24h time-series distribution of threat occurrences."
            />

            {/* Category Distribution */}
            <PieChart
              data={categoryDistribution}
              title="Category Vector Breakdown"
              subtitle="Comparison of active threat distributions."
              donut
            />

            {/* District Comparison */}
            <BarChart
              data={districtComparisonData}
              title="Metropolitan District Comparison"
              subtitle="Horizontal case volume breakdown per key police administrative district."
              orientation="horizontal"
            />

            {/* Spatiotemporal Density */}
            <HeatMap
              data={heatmapData}
              title="District Spatiotemporal Grid"
              subtitle="Intensity grid mapping threat volumes by weekdays and districts."
            />

          </div>

          {/* Predictive Model Section */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Predictive Analytics</h2>
              <p className="text-xs text-muted-foreground">
                Deep neural network forecasts projecting incident volume trends and threat hot-spots.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actual vs Predicted Graph */}
              <div className="lg:col-span-2">
                <PredictionChart
                  actual={actualTrend}
                  predicted={predictedTrend}
                  title="Forecast Trajectory Model"
                  subtitle="Overlay mapping actual weekly incidents vs predictive model targets."
                />
              </div>

              {/* Predictions List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Forecast Forecasts</h4>
                <div className="space-y-3">
                  <PredictionCard
                    title="Bangalore Financial Ring Surge"
                    prediction="High probability of coordinated money transfer anomalies targeting cooperative sectors within next 48 hours."
                    probability={87}
                    timeframe="Next 48 Hours"
                    basis="Transaction velocity outliers"
                  />
                  <PredictionCard
                    title="Sector 4 Phishing Alert"
                    prediction="Moderate possibility of brute force credentials harvesting targeting district office registers."
                    probability={54}
                    timeframe="Next 72 Hours"
                    basis="Incoming connection spikes"
                  />
                </div>
              </div>
            </div>
          </div>

        </main>
      </motion.div>
    </AppShell>
  )
}
