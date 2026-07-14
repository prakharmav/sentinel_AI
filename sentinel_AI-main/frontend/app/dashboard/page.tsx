"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  return (
    <>
      {/* TopAppBar */}
      <header className="bg-surface-dim/80 dark:bg-surface-dim/80 backdrop-blur-xl text-primary font-headline-md text-headline-md fixed top-0 w-full z-50 shadow-2xl flex justify-between items-center px-lg h-16 w-full">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary" data-icon="search" data-weight="fill" style={{fontVariationSettings: "'FILL' 0"}}>search</span>
        </div>
        <div className="flex items-center gap-sm">
          <img alt="SentinelAI" className="h-8 w-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW8IFVxIne0fq-u40TV0KjAun7GLntgapLRUSc1Qf2PkeyB4q8kJ-wPaaPk7yq8OVlov2o3fnbtZ6Oe4UTHPCKylvK5rQGKsHr5R2qj0AlC0xnWlOtvURkgs2XQyiz33ARm5qdLgBwRR8-lSAjeDTUuFmQEz6cQYu5SRT9fCiN-RSKr5qPGdPWrxUYaeS2YLWOuVJy53YvWUrzD_5we5mWH9e66PQ9Hmg0mAz1E2lOA9eY2RY-pjWAGS60-2Wqku1E7bVcyk2k2jI"/>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">SentinelAI</h1>
        </div>
        <button className="flex items-center text-on-surface-variant hover:bg-white/5 transition-colors p-xs rounded-full focus-within:ring-2 focus-within:ring-primary">
          <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-md py-md flex flex-col gap-lg max-w-md mx-auto w-full pt-20">
        {/* Live Risk Score Gauge */}
        <section className="flex flex-col items-center justify-center pt-md pb-sm">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-md">Live Risk Score</h2>
          <div className="gauge-container mb-sm relative">
            <div className="gauge-background"></div>
            <div className="gauge-progress" style={{boxShadow: "0 0 20px theme('colors.tertiary-container')"}}></div>
            <div className="absolute bottom-0 w-full text-center flex flex-col items-center">
              <span className="font-display-lg text-display-lg text-on-surface">78</span>
            </div>
          </div>
          <div className="bg-tertiary-container/10 border border-tertiary-container/30 rounded-full px-md py-xs mt-xs">
            <span className="font-label-md text-label-md text-tertiary-container">Elevated Risk</span>
          </div>
        </section>

        {/* AI Summary Card */}
        <section className="ai-summary-border rounded-xl p-md glass-panel-level-2">
          <div className="flex items-start gap-sm mb-sm">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
            <h3 className="font-headline-md text-headline-md text-primary">SentinelAI Intelligence</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface">
            <strong className="text-white">3 High-Priority Fraud alerts</strong> detected in Sector 7. Predictive models suggest 15% increase in digital scams today.
          </p>
        </section>

        {/* Real-time Heatmap */}
        <section className="flex flex-col gap-sm">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-md text-headline-md text-on-surface">Real-time Heatmap</h2>
            <button className="font-label-sm text-label-sm text-primary uppercase">Filters</button>
          </div>
          <div className="glass-panel-level-1 rounded-xl h-48 relative overflow-hidden flex items-center justify-center">
            <div className="bg-cover bg-center w-full h-full opacity-60 mix-blend-screen absolute inset-0" data-alt="A highly detailed, stylized digital map of a modern metropolitan sector in dark mode." data-location="Sector 7" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCuzaLu-nG-ZLuDIqvhs1N9QSjLFjLuQZW-fiwkyioxaN8NmRe8Q3KNdBRTf3RQ40fmqdlmVz6-oUDMzNzKSyObGGG-dRg8sfUcJPS5BlP8wSPi38CCe8CvZC_5L04kKnmV2CmLsSuSC-KSei8OJ1u1d4pIwXdco5PCy1wb5KQEt7N_YTiXVWZnkbnA1UqHtb_C1daOO7y047ISlnla9svs8SurZbGZ1FjVU6rtmXTOAmIH0SxxhaMZ8TikDPOfWwAnrlRMjOlcGQY')"}}></div>
            {/* Simulated Map UI Overlay */}
            <div className="absolute inset-0 p-sm pointer-events-none">
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-error rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-error rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-tertiary-container rounded-full animate-ping opacity-75" style={{animationDelay: "0.5s"}}></div>
              <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-tertiary-container rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full animate-pulse opacity-50 shadow-[0_0_15px_theme('colors.primary')]"></div>
            </div>
            <div className="absolute bottom-sm right-sm bg-surface-container-highest/80 backdrop-blur rounded px-sm py-xs border border-white/10">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Live feed active</span>
            </div>
          </div>
        </section>

        {/* Urgent Alerts */}
        <section className="flex flex-col gap-sm">
          <div className="flex justify-between items-end mb-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-error" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              Urgent Alerts
            </h2>
            <span className="bg-error/20 text-error font-label-sm text-label-sm px-2 py-1 rounded-full">2 Active</span>
          </div>

          {/* Alert 1 */}
          <div className="glass-panel-level-1 rounded-xl p-md flex flex-col gap-sm hover:border-white/20 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="security">security</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Crime</span>
              </div>
              <span className="bg-error/10 text-error font-label-sm text-label-sm px-2 py-1 rounded border border-error/20">Severity: High</span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface font-medium">Armed Robbery in Progress - Downtown</p>
            <div className="flex justify-between items-center mt-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">2 mins ago</span>
              <button className="font-label-sm text-label-sm text-primary group-hover:text-primary-container transition-colors">View Details</button>
            </div>
          </div>

          {/* Alert 2 */}
          <div className="glass-panel-level-1 rounded-xl p-md flex flex-col gap-sm hover:border-white/20 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant" data-icon="payments">payments</span>
                <span className="font-label-md text-label-md text-on-surface-variant uppercase">Fraud</span>
              </div>
              <span className="bg-error-container/20 text-error font-label-sm text-label-sm px-2 py-1 rounded border border-error-container/30">Severity: Critical</span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface font-medium">Digital Arrest Scam Wave detected <span className="text-on-surface-variant font-normal">(12 reports)</span></p>
            <div className="flex justify-between items-center mt-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">15 mins ago</span>
              <button className="font-label-sm text-label-sm text-primary group-hover:text-primary-container transition-colors">View Details</button>
            </div>
          </div>
        </section>

        <div className="h-8"></div> {/* Spacer for scrolling */}
      </main>

      {/* BottomNavBar */}
      <nav className="bg-surface-container-highest/90 dark:bg-surface-container-highest/90 backdrop-blur-2xl text-primary font-label-sm-mobile text-label-sm-mobile fixed bottom-0 w-full rounded-t-xl z-50 flex justify-around items-center px-md py-sm pb-safe lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        <button className="flex flex-col items-center justify-center text-primary bg-primary/10 rounded-xl px-4 py-1 active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1" data-icon="dashboard" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1" data-icon="troubleshoot">troubleshoot</span>
          <span className="font-label-sm text-label-sm">Investigation</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform relative">
          <span className="material-symbols-outlined mb-1" data-icon="notifications">notifications</span>
          <span className="absolute top-0 right-2 w-2 h-2 bg-error rounded-full"></span>
          <span className="font-label-sm text-label-sm">Alerts</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform">
          <span className="material-symbols-outlined mb-1" data-icon="person">person</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </button>
      </nav>
    </>
  );
}
