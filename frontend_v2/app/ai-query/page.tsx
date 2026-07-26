"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Plus, Download, Maximize2, Minimize2,
  Trash2, BrainCircuit, Sparkles, Send, Mic, Paperclip,
  Volume2, Globe, FileText, Check, AlertCircle, HelpCircle
} from "lucide-react"

// Layout components
import { AppShell } from "@/components/layout"

// Design system primitives
import { AIThinkingLoader } from "@/components/ui"
import { CSSChart } from "@/components/ui/chart"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  translation?: string
  citations?: { label: string; url: string }[]
  tableData?: { headers: string[]; rows: string[][] }
  chartData?: { label: string; value: number }[]
  fileAttachment?: { name: string; size: string }
  timestamp: string
}

interface ChatHistory {
  id: string
  title: string
  timestamp: string
}

const initialHistory: ChatHistory[] = [
  { id: "chat_001", title: "Bangalore Financial Fraud Analysis", timestamp: "10m ago" },
  { id: "chat_002", title: "Delhi Sector-4 Phishing Report", timestamp: "2h ago" },
  { id: "chat_003", title: "Zonal Telemetry Forecast", timestamp: "1d ago" },
]

const suggestions = [
  "Analyze active money trails in Bangalore",
  "Summarize key parameters for case #FIR-2026-48",
  "Compare Delhi cyber incidents against Mumbai",
  "Generate risk forecast for Delhi Sector 4",
]

const aiResponses: Record<string, Partial<Message>> = {
  bangalore: {
    text: "Analyzing transaction data using community detection. I have flagged a suspected fraud ring matching Template #4 (Entity Clustering). Here is the telemetry breakdown for flagged nodes [1].",
    citations: [{ label: "[1] Neo4j Fraud Template #4", url: "/graph" }],
    tableData: {
      headers: ["Account Node", "Transaction Volume", "Flagged Risk"],
      rows: [
        ["ACC-8204", "₹14,50,000", "Critical"],
        ["ACC-1194", "₹9,20,000", "High"],
        ["ACC-3401", "₹3,10,000", "Medium"],
      ],
    },
    chartData: [
      { label: "ACC-8204", value: 14500 },
      { label: "ACC-1194", value: 9200 },
      { label: "ACC-3401", value: 3100 },
    ],
  },
  fir: {
    text: "I have compiled the case statistics for FIR #FIR-2026-48. The digital evidence integrity checks have passed and QR validation stamps have been successfully appended [1].",
    citations: [{ label: "[1] Digital Evidence Lock Protocol", url: "/fir" }],
    tableData: {
      headers: ["Evidence Item", "Digital Hash Verification", "NCRB Standard"],
      rows: [
        ["Audio Record en.wav", "SHA-256 (VALID)", "Section 65B Compliant"],
        ["IP Logging CSV", "SHA-256 (VALID)", "Incident Log Guideline"],
      ],
    },
  },
  delhi: {
    text: "Retrieving metropolitan analytics telemetry. Delhi shows a higher density of phishing scams, while Mumbai reports a larger index of identity theft vectors [1].",
    citations: [{ label: "[1] Zonal Threat Index 2026", url: "/analytics" }],
    chartData: [
      { label: "Delhi (Phishing)", value: 85 },
      { label: "Mumbai (Identity)", value: 110 },
    ],
  },
}

export default function AIQueryPage() {
  const [history, setHistory] = React.useState<ChatHistory[]>(initialHistory)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputVal, setInputVal] = React.useState("")
  const [isThinking, setIsThinking] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [attachedFile, setAttachedFile] = React.useState<{ name: string; size: string } | null>(null)
  
  const chatEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const triggerAIResponse = async (queryText: string) => {
    setIsThinking(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsThinking(false)

    const lower = queryText.toLowerCase()
    let matchKey = "default"
    if (lower.includes("bangalore") || lower.includes("money")) matchKey = "bangalore"
    else if (lower.includes("fir") || lower.includes("case")) matchKey = "fir"
    else if (lower.includes("delhi") || lower.includes("mumbai")) matchKey = "delhi"

    const baseResponse = aiResponses[matchKey] || {
      text: "Understood. Querying SOC database telemetry. No abnormal threat clustering patterns matching your query parameters were identified in this zone.",
    }

    const responseText = baseResponse.text || ""
    const newMsgId = `ai_${Date.now()}`

    // Simulated Message Streaming Animation
    setMessages((prev) => [
      ...prev,
      {
        id: newMsgId,
        sender: "ai",
        text: "",
        timestamp: "Just now",
        citations: baseResponse.citations,
        tableData: baseResponse.tableData,
        chartData: baseResponse.chartData,
      },
    ])

    const words = responseText.split(" ")
    let currentText = ""
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 60))
      currentText += (i === 0 ? "" : " ") + words[i]
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, text: currentText } : m))
      )
    }
  }

  const handleSend = (text: string) => {
    if (!text.trim() && !attachedFile) return
    
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: text,
      fileAttachment: attachedFile || undefined,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMsg])
    setInputVal("")
    setAttachedFile(null)

    triggerAIResponse(text)
  }

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
      })
    }
  }

  const handleClearHistory = () => {
    setHistory([])
    setMessages([])
  }

  return (
    <AppShell>
      <div className={cn("flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]", isFullscreen && "fixed inset-4 z-50 bg-background border rounded-xl p-4 h-[calc(100vh-2rem)]")}>
        
        {/* Left Side: Session History Column */}
        <aside className={cn("w-full lg:w-64 shrink-0 flex flex-col justify-between border rounded-xl bg-card p-4 gap-4", isFullscreen && "hidden lg:flex")}>
          <div className="space-y-4 overflow-hidden flex flex-col flex-1">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Analyses History</h3>
              <button
                onClick={() => setMessages([])}
                className="p-1 rounded hover:bg-accent text-primary focus-ring"
                title="New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No past sessions</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground text-left transition-colors truncate"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1">{item.title}</span>
                    <span className="text-[9px] opacity-60 shrink-0">{item.timestamp}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 shrink-0">
            <button
              onClick={() => alert("Exporting active session chat file...")}
              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Chat Log</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        </aside>

        {/* Right Side: Chat Workspace */}
        <main
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex-1 flex flex-col border rounded-xl bg-card overflow-hidden relative"
        >
          {/* Drag Overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-primary/10 border-2 border-dashed border-primary flex flex-col items-center justify-center backdrop-blur-xs pointer-events-none"
              >
                <div className="p-4 rounded-full bg-primary/20 text-primary mb-3">
                  <Paperclip className="w-6 h-6 animate-bounce" />
                </div>
                <p className="text-sm font-semibold">Drop telemetry logs/incidents here</p>
                <p className="text-xs text-muted-foreground mt-1">Supports CSV, LOG, and PDF formats</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Panel Controls */}
          <div className="flex items-center justify-between px-4 h-12 border-b bg-card shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold">SentinelAI Query Assistant</span>
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors focus-ring"
              title={isFullscreen ? "Minimize" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Active Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center gap-6 py-12">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Interactive AI Telemetry Assistant</h2>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Ask analytical questions, analyze transaction anomalies, or drag and drop logs to generate incident reports.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="text-left text-xs px-3.5 py-2.5 rounded-lg border hover:border-primary/20 hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all focus-ring"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender === "user"
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[85%] gap-2 p-3.5 rounded-xl text-xs",
                        isUser
                          ? "bg-primary text-primary-foreground self-end rounded-tr-none"
                          : "bg-muted text-foreground self-start rounded-tl-none"
                      )}
                    >
                      <div className="flex justify-between items-center gap-6">
                        <span className="font-semibold uppercase tracking-wider text-[9px] opacity-70">
                          {isUser ? "You" : "Sentinel AI"}
                        </span>
                        <span className="opacity-50 text-[9px]">{m.timestamp}</span>
                      </div>

                      {/* Attached File */}
                      {m.fileAttachment && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 text-white w-fit border border-white/5 my-1">
                          <FileText className="w-4 h-4 shrink-0 text-primary" />
                          <div className="flex flex-col text-left">
                            <span className="font-semibold truncate max-w-[120px]">{m.fileAttachment.name}</span>
                            <span className="text-[8px] opacity-60">{m.fileAttachment.size}</span>
                          </div>
                        </div>
                      )}

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>

                      {/* Inline Tables */}
                      {m.tableData && (
                        <div className="border rounded-lg overflow-hidden bg-card mt-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {m.tableData.headers.map((h, i) => (
                                  <TableHead key={i} className="h-8 px-2.5 text-[10px] uppercase font-bold">{h}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {m.tableData.rows.map((row, ri) => (
                                <TableRow key={ri}>
                                  {row.map((cell, ci) => (
                                    <TableCell key={ci} className="p-2.5 font-medium">{cell}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Inline Chart */}
                      {m.chartData && (
                        <div className="mt-3">
                          <CSSChart data={m.chartData} className="h-32" />
                        </div>
                      )}

                      {/* Citations */}
                      {m.citations && (
                        <div className="flex flex-wrap gap-1.5 mt-2 border-t pt-2 border-white/10 opacity-80">
                          {m.citations.map((c, i) => (
                            <a
                              key={i}
                              href={c.url}
                              className="inline-flex items-center gap-1 text-[9px] bg-black/20 hover:bg-black/35 px-1.5 py-0.5 rounded text-primary"
                            >
                              <span>{c.label}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}

              {/* Loader */}
              {isThinking && (
                <div className="self-start">
                  <AIThinkingLoader />
                </div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="border-t p-3 bg-card shrink-0">
            {attachedFile && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted border border-border mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-semibold truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-muted-foreground">{attachedFile.size}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                  aria-label="Remove attachment"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => alert("Activating local voice recorder telemetry...")}
                className="p-2.5 rounded-lg border bg-muted text-muted-foreground hover:text-foreground active:scale-95 focus-ring transition-all"
                title="Voice Query"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0]
                    if (file) {
                      setAttachedFile({
                        name: file.name,
                        size: `${(file.size / 1024).toFixed(1)} KB`,
                      })
                    }
                  }
                  input.click()
                }}
                className="p-2.5 rounded-lg border bg-muted text-muted-foreground hover:text-foreground active:scale-95 focus-ring transition-all"
                title="Attach Log File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(inputVal)
                }}
                placeholder="Ask about money trails, threat vectors, or file cases..."
                className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm focus-ring outline-none"
              />

              <button
                onClick={() => handleSend(inputVal)}
                disabled={!inputVal.trim() && !attachedFile}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 disabled:pointer-events-none active:scale-95 focus-ring transition-all"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </main>
      </div>
    </AppShell>
  )
}
