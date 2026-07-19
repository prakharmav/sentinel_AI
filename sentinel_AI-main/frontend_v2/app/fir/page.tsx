"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Plus, Search, Filter, Shield, BrainCircuit,
  Calendar, MapPin, Phone, User, CheckCircle2, AlertOctagon,
  Mic, Loader2, ArrowRight
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"

interface FirRecord {
  id: string
  firNumber: string
  complainant: string
  phone: string
  incidentDate: string
  location: string
  sections: string[]
  category: string
  summary: string
  status: "REGISTERED" | "INVESTIGATING" | "CLOSED"
  severity: "critical" | "high" | "medium" | "low"
}

const INITIAL_FIRS: FirRecord[] = [
  {
    id: "fir-1",
    firNumber: "FIR-2026-00431",
    complainant: "Rajesh Kumar",
    phone: "+91 98765 43210",
    incidentDate: "2026-07-18",
    location: "Vasanthnagar, Bengaluru",
    sections: ["IT Act Sec 66D", "BNS Sec 318 (Cheating)"],
    category: "Financial Fraud",
    summary: "Victim received fraudulent call masquerading as SBI customer support, was coerced into sending INR 45,000 to a suspect UPI address.",
    status: "INVESTIGATING",
    severity: "high",
  },
  {
    id: "fir-2",
    firNumber: "FIR-2026-00432",
    complainant: "Sunitha Rao",
    phone: "+91 88776 65544",
    incidentDate: "2026-07-17",
    location: "Sector 4, New Delhi",
    sections: ["IT Act Sec 66C", "BNS Sec 316 (Identity Theft)"],
    category: "Identity Theft",
    summary: "Attacker successfully cloned complainant's SIM card and accessed net banking profiles to execute unauthorized debit transfers.",
    status: "REGISTERED",
    severity: "critical",
  },
  {
    id: "fir-3",
    firNumber: "FIR-2026-00433",
    complainant: "Anil Deshmukh",
    phone: "+91 77665 44332",
    incidentDate: "2026-07-15",
    location: "Andheri West, Mumbai",
    sections: ["IT Act Sec 67A"],
    category: "Cyber Bullying",
    summary: "Complainant reports systematic blackmail and cyber harassment via edited synthetic media files distributed on social platforms.",
    status: "CLOSED",
    severity: "medium",
  },
]

export default function FirPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [firs, setFirs] = React.useState<FirRecord[]>(INITIAL_FIRS)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [isNewFirModalOpen, setIsNewFirModalOpen] = React.useState(false)

  // AI Intake Form States
  const [rawText, setRawText] = React.useState("")
  const [isProcessingAI, setIsProcessingAI] = React.useState(false)
  const [aiOutput, setAiOutput] = React.useState<{
    category: string
    sections: string[]
    entities: { victims: string[]; suspects: string[]; amount: string }
    summary: string
  } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const filteredFirs = firs.filter((f) => {
    const matchesSearch =
      f.firNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.complainant.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const runAIProcessing = () => {
    if (!rawText.trim()) return
    setIsProcessingAI(true)
    setTimeout(() => {
      setAiOutput({
        category: "Financial Fraud (UPI Spec)",
        sections: ["IT Act Sec 66D", "BNS Sec 318 (Cheating)", "IPC Sec 420"],
        entities: {
          victims: ["Complainant"],
          suspects: ["Unknown Caller (+91-9988776655)", "mule@upi"],
          amount: "INR 50,000",
        },
        summary: "UPI fraud execution via vishing impersonation. Suspect tricked victim into approving transaction under false pretense of card security update.",
      })
      setIsProcessingAI(false)
    }, 2000)
  }

  const handleRegisterFir = () => {
    if (!aiOutput) return
    const newRecord: FirRecord = {
      id: `fir-${Date.now()}`,
      firNumber: `FIR-2026-00${Math.floor(100 + Math.random() * 900)}`,
      complainant: "Anuj Sharma",
      phone: "+91 99887 76655",
      incidentDate: new Date().toISOString().split("T")[0],
      location: "Sector 11, Dwarka, New Delhi",
      sections: aiOutput.sections,
      category: aiOutput.category,
      summary: aiOutput.summary,
      status: "REGISTERED",
      severity: "high",
    }
    setFirs([newRecord, ...firs])
    setRawText("")
    setAiOutput(null)
    setIsNewFirModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLOSED":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "INVESTIGATING":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
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
              <FileText className="w-6 h-6 text-primary" />
              FIR Command Manager
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              AI-assisted cybercrime case registration and legal mapping portal
            </p>
          </div>
          <button
            onClick={() => setIsNewFirModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            File New Case / FIR
          </button>
        </div>

        {/* Dashboard Statistics summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-xl bg-card/40 backdrop-blur-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total FIR Records</span>
            <span className="text-2xl font-bold font-mono">{firs.length} Cases</span>
          </div>
          <div className="p-4 border rounded-xl bg-card/40 backdrop-blur-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Under Investigation</span>
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {firs.filter((f) => f.status === "INVESTIGATING").length}
            </span>
          </div>
          <div className="p-4 border rounded-xl bg-card/40 backdrop-blur-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Pending Acknowledgment</span>
            <span className="text-2xl font-bold font-mono text-yellow-400">
              {firs.filter((f) => f.status === "REGISTERED").length}
            </span>
          </div>
          <div className="p-4 border rounded-xl bg-card/40 backdrop-blur-md">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Closed/Resolved</span>
            <span className="text-2xl font-bold font-mono text-green-400">
              {firs.filter((f) => f.status === "CLOSED").length}
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border bg-card/40 backdrop-blur-md">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by FIR number, category, or complainant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full h-10 rounded-lg border bg-background/50 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 font-mono"
            />
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-3 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus-visible:outline-none border-none text-foreground cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {/* FIR list cards */}
        <div className="space-y-4">
          {filteredFirs.map((fir) => (
            <motion.div
              key={fir.id}
              layout
              className="rounded-xl border bg-card/50 backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between hover:border-primary/20 transition-all gap-4"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-primary">{fir.firNumber}</span>
                  <Badge className={`border text-[9px] uppercase tracking-wider font-semibold ${getStatusBadge(fir.status)}`}>
                    {fir.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fir.sections.map((sec) => (
                    <Badge key={sec} variant="outline" className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary/80">
                      {sec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-muted/30 py-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary/60" />
                  <strong className="text-foreground">Complainant:</strong> {fir.complainant}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  <strong className="text-foreground">Location:</strong> {fir.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary/60" />
                  <strong className="text-foreground">Filed Date:</strong> {fir.incidentDate}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold mb-1">
                  AI Summary / Narrative
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {fir.summary}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal: New FIR Assistant */}
        {isNewFirModalOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border rounded-xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary animate-pulse" />
                  AI Assisted Case Intake
                </span>
                <button
                  onClick={() => {
                    setIsNewFirModalOpen(false)
                    setRawText("")
                    setAiOutput(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              {/* Text Input area */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Paste Unstructured Complaint / FIR Text
                </label>
                <div className="relative">
                  <textarea
                    rows={6}
                    placeholder="Enter raw report. E.g. 'A victim Rajesh reports that they received a call from +91-9988776655 claiming to be from customer support, prompting them to transfer money to UPI vpa: mule@upi...'"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-lg border bg-background/50 p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-mono resize-none"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-1.5 bg-muted rounded-full text-muted-foreground hover:text-foreground"
                    title="Voice input simulation"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={runAIProcessing}
                  disabled={isProcessingAI || !rawText.trim()}
                  className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isProcessingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Complaint...
                    </>
                  ) : (
                    <>
                      Extract Parameters with AI
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* AI Output Result Box */}
              {aiOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                    <span className="text-xs font-bold text-foreground">Extracted Category: {aiOutput.category}</span>
                    <Badge className="bg-primary/25 text-primary border-primary/30">98.2% Confidence</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <strong className="text-muted-foreground block uppercase text-[9px]">Victims Identified</strong>
                      <span className="text-foreground">{aiOutput.entities.victims.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-muted-foreground block uppercase text-[9px]">Suspect Indicators</strong>
                      <span className="text-foreground">{aiOutput.entities.suspects.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-muted-foreground block uppercase text-[9px]">Loss/Involvement</strong>
                      <span className="text-foreground font-mono text-cyan-400 font-bold">{aiOutput.entities.amount}</span>
                    </div>
                    <div>
                      <strong className="text-muted-foreground block uppercase text-[9px]">Suggested legal sections</strong>
                      <span className="text-foreground">{aiOutput.sections.join(", ")}</span>
                    </div>
                  </div>
                  <div>
                    <strong className="text-muted-foreground block uppercase text-[9px] mb-1">Parsed Narrative</strong>
                    <p className="text-xs text-foreground font-mono leading-relaxed">{aiOutput.summary}</p>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={handleRegisterFir}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Confirm and File FIR
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
