"use client";

import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-zinc-950 text-zinc-100 p-6 selection:bg-teal-500/30">
      
      {/* 1. Header Navigation */}
      <header className="w-full max-w-6xl flex justify-between items-center py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-400 text-3xl">shield</span>
          <span className="font-bold text-xl tracking-tight text-white">Sentinel<span className="text-teal-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono">
            SECURE PORTAL v2.0
          </span>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center text-center my-12 px-4 gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700 text-sm text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Active SOC Database Linked
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-teal-400 bg-clip-text text-transparent leading-tight">
          Unified Autonomous Threat Detection & Response
        </h1>
        
        <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
          State-of-the-art AI-powered platform for cyber threat visualization, bilingual voice intake, automated FIR filing, and real-time community fraud ring detection.
        </p>

        {/* 3. Navigation Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
          <Link 
            href="/dashboard" 
            className="px-8 py-3.5 bg-teal-500 text-zinc-950 font-semibold rounded-lg hover:bg-teal-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(20,184,166,0.3)] text-center"
          >
            Launch Command Center
          </Link>
          <Link 
            href="/citizen" 
            className="px-8 py-3.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800 hover:text-white transition-all active:scale-95 text-center"
          >
            Citizen Voice Ingestion
          </Link>
        </div>

        {/* 4. Visual Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 text-left">
          
          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <span className="material-symbols-outlined text-teal-400 text-3xl mb-3 block group-hover:scale-110 transition-transform">
              hub
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Graph Network Explorer</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Traces money trails and fraud rings dynamically using optimized Neo4j community detection algorithms.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <span className="material-symbols-outlined text-teal-400 text-3xl mb-3 block group-hover:scale-110 transition-transform">
              sound_detection_dog_barking
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Bilingual Voice AI</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Accepts spoken incident reports in English, Hindi, or Kannada, with noise filtering and instant audio TTS feedback.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:border-zinc-700 transition-all group">
            <span className="material-symbols-outlined text-teal-400 text-3xl mb-3 block group-hover:scale-110 transition-transform">
              description
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Sealed PDF Builder</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Auto-compiles official case summaries, charts, and digital evidence logs with verifying secure QR integrity stamps.
            </p>
          </div>

        </div>
      </main>

      {/* 5. Footer */}
      <footer className="w-full max-w-6xl py-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 gap-4 mt-8">
        <p>© 2026 SentinelAI. Standards conforming to NCRB Cyber Incident Response Guidelines.</p>
        <div className="flex gap-4">
          <span className="hover:text-zinc-400 cursor-pointer">Security Compliance</span>
          <span className="hover:text-zinc-400 cursor-pointer">Audit Logs Status</span>
        </div>
      </footer>

    </div>
  );
}
