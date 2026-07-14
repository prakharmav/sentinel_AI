"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  return (
    <>

{/* TopNavBar */}
<header className="bg-surface-container dark:bg-surface-container docked full-width top-0 border-b border-outline-variant/10 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16">
<div className="flex items-center gap-md">
<span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary">SentinelAI</span>
{/* Search Bar (on_left) */}
<div className="relative hidden md:block">
<span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant font-label-md">search</span>
<input className="bg-[#0A0A0A] border border-outline-variant/20 rounded-md pl-xl pr-sm py-sm text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 w-64 placeholder-on-surface-variant/50" placeholder="Global Search..." type="text"/>
</div>
</div>
<div className="flex items-center gap-md text-on-surface-variant">
<button className="hover:bg-white/5 transition-colors p-sm rounded-full cursor-pointer active:scale-95">
<span className="material-symbols-outlined font-headline-md">notifications</span>
</button>
<button className="hover:bg-white/5 transition-colors p-sm rounded-full cursor-pointer active:scale-95">
<span className="material-symbols-outlined font-headline-md">settings</span>
</button>
<button className="hover:bg-white/5 transition-colors p-sm rounded-full cursor-pointer active:scale-95">
<span className="material-symbols-outlined font-headline-md">help</span>
</button>
<div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/20 ml-sm cursor-pointer hover:border-primary transition-colors">
<img alt="Operator Profile" className="w-full h-full object-cover" data-alt="A detailed headshot of a female security operator in a dimly lit command center. She is wearing a dark, modern uniform with subtle blue glowing accents. The lighting is low-key, professional, and serious. High quality, photorealistic, cinematic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzAjWyFQSh6LgfEIqBzgDn7HKxkR1q1xcCZeGBCqWOtM2QXuxVHUhtG6rtQDUZnWKBxJ014oRhW2ypcFNxI9YH6WYVj3UdvM4P66hWR5dvOm-e4I_sq-3qiiJc0yhK30-M8luJd618lpf_BBV2BgmOTsomtWzdZ6O4RPDzUF3BNbnF0hJ1l9LHdIhPdMmEkP5MHH2IwG7U_ltgB4KKKeECim3Ku9cWSfSy0sQDotv5rCt9MuCX5zsHXlZ1mGT403kbum0JmfSJI9w"/>
</div>
</div>
</header>
<div className="flex flex-1 pt-16 overflow-hidden">
{/* SideNavBar */}
<nav className="bg-surface-container-low dark:bg-surface-container-low docked left-0 h-full w-64 border-r border-outline-variant/10 shadow-lg fixed left-0 top-16 h-[calc(100vh-64px)] z-40 flex flex-col p-md hidden md:flex">
{/* Header Context */}
<div className="mb-lg flex items-center gap-md p-sm">
<div className="w-10 h-10 rounded-lg bg-surface-variant overflow-hidden border border-outline-variant/20">
<img alt="System Status" className="w-full h-full object-cover" data-alt="A glowing blue orb representing an artificial intelligence system core. It sits against a stark black background, pulsing with faint digital data streams. The mood is high-tech, precise, and authoritative." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHNl06CJlAkxEu_798dBtUrIWEGTnvzmUL66qLK0S1J3ByVjo21oI8Dph_ZMxcb7-HHdkB8WmJS8b0DWVA7vFLhNksXEsKkbaCLIEhTtIqBmEBX2yKo8DPfu9I7d4g4sGeHc14j1DR2cAtDGkx1wpNZJMyN1XcvcL2wP3RT96vftElwKwRwpF4b1OK28Ca78Eqay3h5sGSjTaXH0ZHqqi2fX2P1sH_ZfLXq8kPhVZT23B5JIe1olarHGMRaFtFpAmV-l8WQhx3VTw"/>
</div>
<div>
<div className="font-label-md text-label-md text-on-surface font-semibold">Command Center</div>
<div className="font-label-sm text-label-sm text-on-surface-variant">Active Ops</div>
</div>
</div>
<ul className="flex flex-col gap-sm flex-1">
<li>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all cursor-pointer scale-100 active:scale-98 rounded-lg" href="#">
<span className="material-symbols-outlined">query_stats</span>
<span className="font-label-md text-label-md">Intelligence</span>
</a>
</li>
<li>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all cursor-pointer scale-100 active:scale-98 rounded-lg" href="#">
<span className="material-symbols-outlined">map</span>
<span className="font-label-md text-label-md">Tactical Map</span>
</a>
</li>
<li>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all cursor-pointer scale-100 active:scale-98 rounded-lg" href="#">
<span className="material-symbols-outlined">folder_shared</span>
<span className="font-label-md text-label-md">Case Management</span>
</a>
</li>
<li>
<a className="flex items-center gap-md p-sm bg-primary-container text-on-primary-container rounded-lg font-bold cursor-pointer scale-100 active:scale-98 transition-transform" href="#">
<span className="material-symbols-outlined fill">description</span>
<span className="font-label-md text-label-md">Reports</span>
</a>
</li>
<li>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all cursor-pointer scale-100 active:scale-98 rounded-lg" href="#">
<span className="material-symbols-outlined">history</span>
<span className="font-label-md text-label-md">Audit Logs</span>
</a>
</li>
</ul>
<div className="mt-auto pt-md border-t border-outline-variant/10">
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all cursor-pointer scale-100 active:scale-98 rounded-lg" href="#">
<span className="material-symbols-outlined">contact_support</span>
<span className="font-label-md text-label-md">Support</span>
</a>
</div>
</nav>
{/* Main Content */}
<main className="flex-1 md:ml-64 overflow-y-auto p-md md:p-lg bg-surface dark:bg-surface">
{/* 1. Header & Filters */}
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-lg gap-md">
<div>
<h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Crime Analytics &amp; Intelligence</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Real-time threat assessment and predictive modeling across all sectors.</p>
</div>
<div className="flex flex-wrap items-center gap-sm">
{/* Date Range Picker Mock */}
<div className="flex items-center bg-[#0A0A0A] border border-outline-variant/20 rounded-md px-sm py-sm">
<span className="material-symbols-outlined text-on-surface-variant text-sm mr-xs">calendar_today</span>
<span className="font-label-md text-label-md text-on-surface">Last 30 Days</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm ml-xs">arrow_drop_down</span>
</div>
{/* Filter: District */}
<div className="flex items-center bg-[#0A0A0A] border border-outline-variant/20 rounded-md px-sm py-sm">
<span className="material-symbols-outlined text-on-surface-variant text-sm mr-xs">location_on</span>
<span className="font-label-md text-label-md text-on-surface">All Districts</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm ml-xs">arrow_drop_down</span>
</div>
{/* Filter: Crime Type */}
<div className="flex items-center bg-[#0A0A0A] border border-outline-variant/20 rounded-md px-sm py-sm">
<span className="material-symbols-outlined text-on-surface-variant text-sm mr-xs">category</span>
<span className="font-label-md text-label-md text-on-surface">All Types</span>
<span className="material-symbols-outlined text-on-surface-variant text-sm ml-xs">arrow_drop_down</span>
</div>
{/* Export Button */}
<button className="bg-primary text-on-primary hover:bg-primary-fixed-dim transition-colors rounded-md px-md py-sm flex items-center gap-xs font-label-md text-label-md shadow-sm">
<span className="material-symbols-outlined text-sm">download</span>
                        Export
                    </button>
</div>
</div>
{/* 2. KPI Ribbon */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
{/* KPI 1: Total Incidents */}
<div className="glass-panel glass-panel-hover rounded-xl p-md flex flex-col justify-between">
<div className="flex justify-between items-start mb-sm">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Incidents</span>
<span className="material-symbols-outlined text-chart-blue bg-chart-blue/10 p-xs rounded-md">warning</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-display-lg text-display-lg text-on-surface">1,248</span>
<span className="font-label-sm text-label-sm text-error bg-error/10 px-xs py-[2px] rounded mb-xs flex items-center">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +5.2%
                        </span>
</div>
</div>
{/* KPI 2: Clearance Rate */}
<div className="glass-panel glass-panel-hover rounded-xl p-md flex flex-col justify-between">
<div className="flex justify-between items-start mb-sm">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Clearance Rate</span>
<span className="material-symbols-outlined text-chart-teal bg-chart-teal/10 p-xs rounded-md">check_circle</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-display-lg text-display-lg text-on-surface">68.4%</span>
<span className="font-label-sm text-label-sm text-chart-teal bg-chart-teal/10 px-xs py-[2px] rounded mb-xs flex items-center">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +2.1%
                        </span>
</div>
</div>
{/* KPI 3: Avg Response Time */}
<div className="glass-panel glass-panel-hover rounded-xl p-md flex flex-col justify-between">
<div className="flex justify-between items-start mb-sm">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg Response Time</span>
<span className="material-symbols-outlined text-chart-yellow bg-chart-yellow/10 p-xs rounded-md">timer</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-display-lg text-display-lg text-on-surface">04:12</span>
<span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">min:sec</span>
</div>
</div>
{/* KPI 4: AI Predicted Risk */}
<div className="glass-panel glass-panel-hover rounded-xl p-md flex flex-col justify-between ai-border-glow">
<div className="flex justify-between items-start mb-sm">
<span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">AI Risk Level</span>
<span className="material-symbols-outlined text-error bg-error/10 p-xs rounded-md">policy</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-display-lg text-display-lg text-error">ELEVATED</span>
<span className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Sector 4</span>
</div>
</div>
</div>
{/* Dashboard Grid Layout */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
{/* 3. Hero Section: Predictive Heatmap */}
<div className="lg:col-span-8 glass-panel rounded-xl flex flex-col overflow-hidden min-h-[400px]">
<div className="p-md border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-high">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-on-surface-variant">explore</span>
<h2 className="font-headline-md text-headline-md text-on-surface">Tactical Jurisdiction Heatmap</h2>
</div>
<div className="flex gap-xs">
<button className="bg-[#0A0A0A] border border-outline-variant/20 rounded px-sm py-xs font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface">Live</button>
<button className="bg-primary/20 border border-primary/50 text-primary rounded px-sm py-xs font-label-sm text-label-sm">AI Predicted</button>
</div>
</div>
<div className="flex-1 relative bg-[#050505]">
{/* Map Placeholder */}
<div className="absolute inset-0 bg-cover bg-center" data-alt="A highly detailed, dark-mode digital map of a sprawling metropolis viewed from above. The map features neon-blue glowing streets and distinct, intense red thermal hotspots indicating areas of high activity. The aesthetic is cybernetic, military-grade, and sophisticated." data-location="Metropolis" style={{backgroundImage: "url('https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg')"}}></div>
{/* Map Overlay UI */}
<div className="absolute bottom-md right-md glass-panel-blur p-sm rounded-lg flex flex-col gap-xs">
<div className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Risk Density</div>
<div className="flex items-center gap-sm">
<span className="text-xs text-on-surface-variant">Low</span>
<div className="w-24 h-2 rounded bg-gradient-to-r from-chart-blue via-chart-yellow to-error"></div>
<span className="text-xs text-on-surface-variant">High</span>
</div>
</div>
</div>
</div>
{/* 4. Data Grid: AI Intelligence Insights */}
<div className="lg:col-span-4 glass-panel rounded-xl flex flex-col ai-border-glow">
<div className="p-md border-b border-outline-variant/10 bg-surface-container-high flex items-center gap-sm">
<span className="material-symbols-outlined text-primary">smart_toy</span>
<h2 className="font-headline-md text-headline-md text-on-surface">SentinelAI Insights</h2>
</div>
<div className="p-md flex-1 flex flex-col gap-md overflow-y-auto">
<div className="bg-[#0A0A0A] border border-outline-variant/20 rounded-lg p-sm flex gap-sm">
<span className="material-symbols-outlined text-error mt-xs">trending_up</span>
<div>
<div className="font-label-md text-label-md text-on-surface mb-xs">Emerging Pattern Detected</div>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">15% spike in vehicle thefts predicted in Sector 4 over the next 48 hours based on historical weekend data and recent local event schedules.</p>
</div>
</div>
<div className="bg-[#0A0A0A] border border-outline-variant/20 rounded-lg p-sm flex gap-sm">
<span className="material-symbols-outlined text-chart-teal mt-xs">verified</span>
<div>
<div className="font-label-md text-label-md text-on-surface mb-xs">Resource Optimization</div>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Re-routing Unit Alpha-7 to District North could reduce average response times by an estimated 1.2 minutes during peak hours.</p>
</div>
</div>
<div className="bg-[#0A0A0A] border border-outline-variant/20 rounded-lg p-sm flex gap-sm">
<span className="material-symbols-outlined text-chart-yellow mt-xs">warning_amber</span>
<div>
<div className="font-label-md text-label-md text-on-surface mb-xs">Anomaly Alert</div>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Unusual cluster of noise complaints in Residential Zone B. Cross-referencing with local permit databases suggests unauthorized gatherings.</p>
</div>
</div>
</div>
</div>
{/* Data Grid: Crime Trends (Line Chart) */}
<div className="lg:col-span-8 glass-panel rounded-xl flex flex-col min-h-[300px]">
<div className="p-md border-b border-outline-variant/10 bg-surface-container-high flex justify-between items-center">
<h2 className="font-headline-md text-headline-md text-on-surface">Crime Trends vs Predictions</h2>
<span className="material-symbols-outlined text-on-surface-variant">show_chart</span>
</div>
<div className="p-md flex-1 relative">
<canvas id="crimeTrendsChart"></canvas>
</div>
</div>
{/* Data Grid: District Comparison (Bar Chart) & Crime Type (Donut) */}
<div className="lg:col-span-4 flex flex-col gap-md">
{/* District Comparison */}
<div className="glass-panel rounded-xl flex flex-col flex-1 min-h-[200px]">
<div className="p-md border-b border-outline-variant/10 bg-surface-container-high">
<h2 className="font-headline-md text-headline-md text-on-surface">District Breakdown</h2>
</div>
<div className="p-md flex-1 relative">
<canvas id="districtBarChart"></canvas>
</div>
</div>
{/* Crime Type Distribution */}
<div className="glass-panel rounded-xl flex flex-col flex-1 min-h-[200px]">
<div className="p-md border-b border-outline-variant/10 bg-surface-container-high">
<h2 className="font-headline-md text-headline-md text-on-surface">Incident Typology</h2>
</div>
<div className="p-md flex-1 relative flex justify-center items-center">
<canvas id="crimeTypeChart"></canvas>
</div>
</div>
</div>
</div>
</main>
</div>
{/* Chart.js Initialization */}


    </>
  );
}
