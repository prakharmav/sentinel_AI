"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  return (
    <>

{/* TopAppBar */}
<header className="bg-surface-dim/80 dark:bg-surface-dim/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-white/10 shadow-2xl flex justify-between items-center px-lg h-16 transition-colors">
<button className="text-on-surface-variant hover:bg-white/5 p-2 rounded-full focus-within:ring-2 focus-within:ring-primary transition-colors flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">menu</span>
</button>
<div className="flex items-center gap-2">
<img alt="SentinelAI Logo" className="w-8 h-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLv67_2O2MR-fghddOPjWKZFRzKIn-08szMNf3Ejmr26iPNa4f__pIooMK0dQ2mRFJN1J9aA98AAv8Q3TfafisDJHNHuFV7Ei4s0FvllEkKktIkGguVph99a735rb-AeDuFNDiNTi6YWtZ6ZWKVvnQ01FEVSfuHbw5FRO3TCKbxPDLgumrFEwT4dxxAIwBiCqoM6xdSG-Bv8laVJYn7ik6brxqDG70Meyahscw18bHjs2aCTxHa589YrgvQ"/>
<span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">SentinelAI</span>
</div>
<button className="text-on-surface-variant hover:bg-white/5 p-2 rounded-full focus-within:ring-2 focus-within:ring-primary transition-colors flex items-center justify-center">
<span className="material-symbols-outlined text-[24px]">account_circle</span>
</button>
</header>
{/* Main Chat Area */}
<main className="flex-1 overflow-y-auto pt-[80px] pb-[160px] px-md flex flex-col gap-lg">
{/* Welcome Message / System Status */}
<div className="flex flex-col items-center justify-center mt-xl mb-md">
<div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-sm pulse-border border-primary/30 border-2">
<span className="material-symbols-outlined text-primary text-[32px]">hub</span>
</div>
<h1 className="font-headline-md text-headline-md text-on-surface font-semibold">Secure Intelligence Uplink</h1>
<p className="font-body-md text-body-md text-on-surface-variant mt-xs">End-to-end encrypted. AI Core is active.</p>
</div>
{/* System Message Bubble */}
<div className="flex gap-sm self-start max-w-[90%]">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 border border-white/5">
<span className="material-symbols-outlined text-primary text-[18px]">robot_2</span>
</div>
<div className="glass-panel p-md rounded-2xl rounded-tl-sm border-l-2 border-l-primary/50">
<p className="font-body-md text-body-md text-on-surface">Operator recognized. Scanning Sector 7-G anomalies. How can I assist with your current investigation?</p>
<div className="flex gap-2 mt-sm">
<button className="bg-surface-container text-on-surface border border-white/10 px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 hover:bg-white/5 transition-colors">
<span className="material-symbols-outlined text-[14px]">history</span> Recent Alerts
                    </button>
<button className="bg-surface-container text-on-surface border border-white/10 px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 hover:bg-white/5 transition-colors">
<span className="material-symbols-outlined text-[14px]">upload_file</span> Attach Case File
                    </button>
</div>
</div>
</div>
{/* User Message Bubble */}
<div className="flex gap-sm self-end max-w-[90%] flex-row-reverse">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
</div>
<div className="bg-[#1C1C1E] border border-white/5 p-md rounded-2xl rounded-tr-sm shadow-lg">
<p className="font-body-md text-body-md text-on-surface">Cross-reference FIRs related to vehicle theft in the last 48 hours. Generate a network map.</p>
</div>
</div>
{/* AI Generating Response (Skeleton / Thinking) */}
<div className="flex gap-sm self-start max-w-[90%]">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 border border-white/5">
<span className="material-symbols-outlined text-primary text-[18px]">memory</span>
</div>
<div className="glass-panel p-sm px-md rounded-2xl rounded-tl-sm flex items-center gap-sm">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Processing Query</span>
<div className="typing-indicator flex items-center h-4">
<span></span><span></span><span></span>
</div>
</div>
</div>
{/* AI Detailed Response with Graph */}
<div className="flex gap-sm self-start max-w-[95%]">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 border border-white/5">
<span className="material-symbols-outlined text-primary text-[18px]">robot_2</span>
</div>
<div className="glass-panel p-md rounded-2xl rounded-tl-sm w-full">
<div className="flex justify-between items-center mb-sm">
<span className="font-label-md text-label-md text-primary font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">verified</span> Intelligence Summary</span>
<div className="flex gap-1">
<button className="text-on-surface-variant hover:text-on-surface p-1"><span className="material-symbols-outlined text-[16px]">content_copy</span></button>
<button className="text-on-surface-variant hover:text-on-surface p-1"><span className="material-symbols-outlined text-[16px]">share</span></button>
</div>
</div>
<p className="font-body-md text-body-md text-on-surface mb-sm leading-relaxed">
                    Found 14 related First Information Reports (FIRs) within the specified timeframe. Analysis indicates a coordinated pattern focusing on high-end SUVs.
                </p>
{/* Table Markdown rendering simulation */}
<div className="border border-white/10 rounded-lg overflow-hidden mb-md bg-[#10131B]">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase border-b border-white/5">
<th className="p-2">Time</th>
<th className="p-2">Zone</th>
<th className="p-2">Status</th>
</tr>
</thead>
<tbody className="font-body-md text-body-md text-on-surface text-[13px]">
<tr className="border-b border-white/5">
<td className="p-2">02:14 AM</td>
<td className="p-2">North-East</td>
<td className="p-2 text-error">Unresolved</td>
</tr>
<tr>
<td className="p-2">04:30 AM</td>
<td className="p-2">Central</td>
<td className="p-2 text-tertiary-container">Tracking</td>
</tr>
</tbody>
</table>
</div>
{/* Network Graph Preview Component */}
<div className="rounded-xl overflow-hidden border border-white/10 bg-surface-container-lowest relative group">
{/* Placeholder for Network Graph Visual */}
<div className="h-32 w-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-dim relative">
{/* Abstract graph nodes simulation */}
<div className="absolute w-2 h-2 rounded-full bg-primary top-1/4 left-1/4 shadow-[0_0_8px_#aac7ff]"></div>
<div className="absolute w-3 h-3 rounded-full bg-error top-1/2 left-1/2 shadow-[0_0_8px_#ffb4ab]"></div>
<div className="absolute w-2 h-2 rounded-full bg-tertiary top-3/4 left-2/3 shadow-[0_0_8px_#ffb691]"></div>
<svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/20" preserveAspectRatio="none" viewBox="0 0 100 100">
<line stroke-dasharray="2 2" stroke-width="0.5" x1="25" x2="50" y1="25" y2="50"></line>
<line stroke-width="0.5" x1="50" x2="66" y1="50" y2="75"></line>
</svg>
<div className="z-10 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[16px]">hub</span>
<span className="font-label-sm text-label-sm text-on-surface">Generate Interactive Map</span>
</div>
</div>
</div>
<div className="mt-sm flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
<span className="bg-surface-container text-on-surface px-2 py-1 rounded text-[10px] font-mono border border-white/5">#auto-theft</span>
<span className="bg-surface-container text-on-surface px-2 py-1 rounded text-[10px] font-mono border border-white/5">#syndicate-beta</span>
</div>
</div>
</div>
</main>
{/* Bottom Input System */}
<div className="fixed bottom-0 left-0 w-full z-40 px-sm pb-safe pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
{/* Prompt Suggestions */}
<div className="flex gap-2 overflow-x-auto px-sm pb-2 mb-1 scrollbar-hide w-full">
<button className="whitespace-nowrap bg-surface-container-low border border-white/10 hover:border-primary/50 text-on-surface px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-primary">search</span> Analyze Patterns
            </button>
<button className="whitespace-nowrap bg-surface-container-low border border-white/10 hover:border-primary/50 text-on-surface px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-tertiary">warning</span> Escalation Path
            </button>
</div>
{/* Input Bar */}
<div className="glass-panel-heavy rounded-2xl p-2 mx-2 mb-4 flex items-end gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0 mb-1">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
</button>
<div className="flex-1 bg-black/20 rounded-xl border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all min-h-[44px] flex items-center px-3 mb-1">
<textarea className="w-full bg-transparent border-none text-body-md text-on-surface placeholder-on-surface-variant/50 focus:ring-0 resize-none max-h-32 py-2" placeholder="Enter command or query..." rows={1} style={{ scrollbarWidth: 'none' }}></textarea>
</div>
<button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 glow-btn transition-all mb-1 shadow-lg shadow-primary/20">
<span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
</button>
</div>
</div>


    </>
  );
}
