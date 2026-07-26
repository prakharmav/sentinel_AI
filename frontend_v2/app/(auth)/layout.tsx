"use client"

import { Shield, Radio, Brain, Network, FileSearch, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const features = [
    { icon: Brain, label: "AI Threat Detection", desc: "Real-time ML-powered cyber threat analysis" },
    { icon: Network, label: "Fraud Ring Mapping", desc: "Neo4j graph visualization of criminal networks" },
    { icon: Radio, label: "Voice FIR Filing", desc: "Bilingual Hindi/English voice complaint intake" },
    { icon: FileSearch, label: "Auto FIR Generation", desc: "IPC/BNS section mapping with AI" },
    { icon: AlertTriangle, label: "Predictive Hotspots", desc: "Spatio-temporal crime prediction engine" },
  ]

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Branding Panel */}
      <div className="hidden md:flex md:w-1/2 xl:w-[55%] relative overflow-hidden bg-background border-r border-primary/30 tech-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20" />

        {/* Animated scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-primary/10 border border-primary/30 glow-cyan">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Sentinel<span className="text-primary glow-text">AI</span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-medium">
                Cyber Command Center
              </p>
            </div>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-3">
                Ministry of Home Affairs • NCRB Integrated
              </p>
              <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-tight mb-3">
                AI-Powered{" "}
                <span className="text-primary glow-text">Cybercrime</span>
                <br />
                Command Platform
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Real-time threat detection, autonomous response, and criminal network 
                analysis for law enforcement agencies across India.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 p-2.5 rounded-sm bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors group"
                >
                  <f.icon className="w-4 h-4 text-primary mt-0.5 shrink-0 group-hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary glow-text">99.7%</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Uptime SLA</span>
              </div>
              <div className="w-px h-10 bg-primary/30" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary glow-text">{'<'}200ms</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Response</span>
              </div>
              <div className="w-px h-10 bg-primary/30" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary glow-text">AES-256</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Encrypted</span>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-[10px] text-muted-foreground space-y-1 uppercase tracking-wider">
            <p>© 2026 SentinelAI • NCRB Compliant • ISO 27001</p>
            <p>For authorized law enforcement personnel only</p>
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
