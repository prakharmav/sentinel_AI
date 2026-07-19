"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare, Send, Sparkles, AlertTriangle, ShieldCheck,
  BrainCircuit, RefreshCw, Bot, User, CornerDownLeft
} from "lucide-react"

// Layout Components
import { AppShell, LayoutSkeleton } from "@/components/layout"

// UI components
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: string[]
  confidence?: number
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Welcome to the SentinelAI Security Intelligence Assistant. Ask me anything about current cases, suspect nodes, or threat streams. E.g. 'Show me financial fraud cases near Bangalore' or 'Are there any indicators for mule@upi?'",
    timestamp: "Just Now",
  },
]

export default function ChatPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [input, setInput] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES)
  const [isTyping, setIsTyping] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Simulate AI response based on query keywords
    setTimeout(() => {
      let content = "I've searched our PostgreSQL evidence files and Neo4j threat graph databases. No direct indicators were mapped to this query. Please check parameters or view the graph telemetry charts."
      let citations: string[] = ["Internal Evidence Locker"]
      let confidence = 0.85

      const text = userMsg.content.toLowerCase()
      if (text.includes("mule") || text.includes("upi") || text.includes("9988776655")) {
        content = "Security Intelligence Match: The suspect UPI address 'mule@upi' is associated with 4 active FIR records filed under 'Financial Fraud' in Bengaluru. The Neo4j graph reveals this account received transfers totaling INR 45,000 from 3 distinct victim nodes within Dwarka, Delhi. Recommend immediate quarantine of account tokens."
        citations = ["FIR-2026-00431", "Neo4j Graph Database (Dwarka Fraud Ring)", "PostgreSQL transactions table"]
        confidence = 0.96
      } else if (text.includes("case") || text.includes("fir") || text.includes("crime")) {
        content = "Based on recent cases: We have 3 primary active incident files. 1) Phishing attack on registry office, Dwarka. 2) Sim clone identity theft, Dwarka. 3) Cyber harassment case, Mysore Road, Mysore. Let me know if you would like me to draft a summary report for any of these."
        citations = ["FIR Manager Database", "NIST Incident Log"]
        confidence = 0.92
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        confidence,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, 2000)
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
        className="flex flex-col h-[calc(100vh-140px)] max-h-[700px] border bg-card/40 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-muted/40 border-b px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xs font-bold font-mono tracking-widest text-foreground uppercase">
                AI CONVERSATIONAL SOC INTERFACE (NLSI)
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                RAG Engine over Postgres logs, Neo4j graphs, and compliance templates
              </p>
            </div>
          </div>
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="p-1 rounded bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                msg.role === "user" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-muted-foreground/20 text-foreground"
              }`}>
                {msg.role === "user" ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5 text-cyan-400" />}
              </div>

              {/* Bubble */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs relative ${
                msg.role === "user"
                  ? "bg-primary/5 border-primary/20 text-foreground rounded-tr-none"
                  : "bg-background/80 border-muted/50 text-foreground rounded-tl-none"
              }`}>
                <p className="leading-relaxed font-mono whitespace-pre-wrap">{msg.content}</p>

                {/* Additional metadata for assistant response */}
                {msg.role === "assistant" && (msg.citations || msg.confidence) && (
                  <div className="border-t border-muted/30 pt-2 flex flex-col gap-1.5 text-[10px] text-muted-foreground font-mono">
                    {msg.confidence && (
                      <div className="flex justify-between items-center">
                        <span>Intelligent Match Score:</span>
                        <span className="text-cyan-400 font-bold">{(msg.confidence * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {msg.citations && msg.citations.length > 0 && (
                      <div>
                        <span className="block mb-1 text-muted-foreground/60">Citations:</span>
                        <div className="flex flex-wrap gap-1">
                          {msg.citations.map((c) => (
                            <Badge key={c} variant="outline" className="text-[9px] border-primary/10 bg-primary/5 text-primary/70">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="absolute bottom-1 right-2 text-[9px] text-muted-foreground/50 font-mono select-none">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-muted border-muted-foreground/20 text-foreground">
                <Bot className="w-4.5 h-4.5 text-cyan-400" />
              </div>
              <div className="p-3.5 rounded-xl border bg-background/80 border-muted/50 text-foreground rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="border-t p-3 bg-muted/20">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Query logs, cases, and graphs (e.g. 'Show cases involving mule@upi')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-lg border bg-background/50 h-10 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/40 font-mono"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </AppShell>
  )
}
