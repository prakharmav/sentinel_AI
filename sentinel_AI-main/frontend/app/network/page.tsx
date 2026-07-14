"use client";

import React, { useState, useEffect } from 'react';

export default function Page() {
  return (
    <>

{/* JSON Component: SideNavBar */}
<nav className="hidden md:flex bg-surface-container-low border-r border-outline-variant h-screen w-64 flex-col py-md z-40 shrink-0">
{/* Header */}
<div className="px-md mb-xl flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-primary-container" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>shield_person</span>
</div>
<div>
<h2 className="font-headline-md text-headline-md text-on-surface truncate">Unit 74-B</h2>
<p className="font-label-sm text-label-sm text-on-surface-variant truncate">High-Priority Analysis</p>
</div>
</div>
{/* CTA */}
<div className="px-md mb-xl">
<button className="w-full bg-primary text-on-primary py-sm px-md rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-sm">
<span className="material-symbols-outlined text-[18px]">add</span>
                New Investigation
            </button>
</div>
{/* Navigation Links */}
<div className="flex-1 overflow-y-auto">
<ul className="px-sm space-y-xs">
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">hub</span>
                        Workspace
                    </a>
</li>
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">folder_shared</span>
                        Case Files
                    </a>
</li>
<li>
{/* Active State Applied Here based on 'Criminal Network Graph' intent matching Intelligence best */}
<a className="flex items-center gap-md px-md py-sm rounded-lg bg-secondary-container text-on-secondary-container transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                        Intelligence
                    </a>
</li>
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">timeline</span>
                        Timeline
                    </a>
</li>
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">inventory_2</span>
                        Archive
                    </a>
</li>
</ul>
</div>
{/* Footer Links */}
<div className="mt-auto px-sm pt-md border-t border-outline-variant/30">
<ul className="space-y-xs">
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">settings</span>
                        Settings
                    </a>
</li>
<li>
<a className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-variant transition-transform scale-95 active:scale-90 font-label-md text-label-md" href="#">
<span className="material-symbols-outlined">help_outline</span>
                        Support
                    </a>
</li>
</ul>
</div>
</nav>
{/* Main Content Area */}
<div className="flex-1 flex flex-col min-w-0 relative">
{/* JSON Component: TopNavBar */}
<header className="bg-surface border-b border-outline-variant shadow-sm w-full h-16 sticky top-0 z-50 flex justify-between items-center px-lg shrink-0">
{/* Brand & Search Left */}
<div className="flex items-center gap-xl h-full">
<div className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-sm">
<span className="material-symbols-outlined text-[28px]">graphic_eq</span>
                    SentinelAI Network Analyst
                </div>
{/* Integrated Search */}
<div className="hidden md:flex relative w-64 items-center">
<span className="material-symbols-outlined absolute left-sm text-on-surface-variant text-[20px]">search</span>
<input className="w-full bg-surface-variant border border-outline-variant rounded-full py-[6px] pl-[36px] pr-sm text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/70 transition-all" placeholder="Search network nodes..." type="text"/>
</div>
</div>
{/* Trailing Icons */}
<div className="flex items-center gap-sm h-full">
<button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200">
<span className="material-symbols-outlined">notifications</span>
</button>
<button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200">
<span className="material-symbols-outlined">history</span>
</button>
<button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors duration-200">
<span className="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
{/* 3-Column Architecture Workspace */}
<main className="flex-1 flex overflow-hidden relative bg-[#010101]">
{/* Column 1: Left Sidebar Filters (Glassmorphism over dark background) */}
<aside className="w-72 glass-panel border-r border-t-0 border-b-0 border-l-0 flex flex-col z-10 shrink-0">
<div className="p-md border-b border-white/10">
<h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Graph Filters</h3>
<p className="font-label-sm text-label-sm text-on-surface-variant">Adjust network visibility</p>
</div>
<div className="flex-1 overflow-y-auto p-md space-y-xl">
{/* Relationship Type */}
<div>
<h4 className="font-label-md text-label-md text-primary mb-md tracking-wider uppercase">Relationship Type</h4>
<div className="space-y-sm">
<label className="flex items-center gap-sm cursor-pointer group">
<div className="relative flex items-center justify-center w-4 h-4">
<input defaultChecked className="peer sr-only" type="checkbox"/>
<div className="w-4 h-4 border border-outline-variant rounded bg-surface-container-low peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
<span className="material-symbols-outlined text-[12px] text-on-primary absolute opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
</div>
<span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">Financial</span>
</label>
<label className="flex items-center gap-sm cursor-pointer group">
<div className="relative flex items-center justify-center w-4 h-4">
<input defaultChecked className="peer sr-only" type="checkbox"/>
<div className="w-4 h-4 border border-outline-variant rounded bg-surface-container-low peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
<span className="material-symbols-outlined text-[12px] text-on-primary absolute opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
</div>
<span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">Communication</span>
</label>
<label className="flex items-center gap-sm cursor-pointer group">
<div className="relative flex items-center justify-center w-4 h-4">
<input className="peer sr-only" type="checkbox"/>
<div className="w-4 h-4 border border-outline-variant rounded bg-surface-container-low peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
<span className="material-symbols-outlined text-[12px] text-on-primary absolute opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
</div>
<span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">Familial</span>
</label>
<label className="flex items-center gap-sm cursor-pointer group">
<div className="relative flex items-center justify-center w-4 h-4">
<input defaultChecked className="peer sr-only" type="checkbox"/>
<div className="w-4 h-4 border border-outline-variant rounded bg-surface-container-low peer-checked:bg-error peer-checked:border-error transition-colors"></div>
<span className="material-symbols-outlined text-[12px] text-on-error absolute opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
</div>
<span className="font-body-md text-body-md text-on-surface group-hover:text-error transition-colors">Criminal Link</span>
</label>
</div>
</div>
{/* Timeline Slider */}
<div>
<h4 className="font-label-md text-label-md text-primary mb-md tracking-wider uppercase">Timeline</h4>
<div className="px-xs">
<input className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" max="100" min="1" type="range" value="75"/>
<div className="flex justify-between mt-sm font-label-sm text-label-sm text-on-surface-variant">
<span>24h</span>
<span>1Y</span>
<span>5Y</span>
</div>
</div>
</div>
{/* Legend */}
<div className="pt-md border-t border-white/10">
<h4 className="font-label-md text-label-md text-primary mb-md tracking-wider uppercase">Node Legend</h4>
<div className="grid grid-cols-2 gap-sm">
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-full border border-primary bg-primary/20"></div>
<span className="font-label-sm text-label-sm text-on-surface">Suspect</span>
</div>
<div className="flex items-center gap-xs">
<div className="w-3 h-3 rounded-md border border-tertiary bg-tertiary/20"></div>
<span className="font-label-sm text-label-sm text-on-surface">Vehicle</span>
</div>
<div className="flex items-center gap-xs">
<div className="w-3 h-3 border border-secondary bg-secondary/20 node-hexagon"></div>
<span className="font-label-sm text-label-sm text-on-surface">Account</span>
</div>
<div className="flex items-center gap-xs">
<span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
<span className="font-label-sm text-label-sm text-on-surface">Location</span>
</div>
</div>
</div>
</div>
</aside>
{/* Column 2: Center Workspace (Graph Area) */}
<section className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1C1C1E] via-[#010101] to-[#010101] overflow-hidden">
{/* Graph Background Grid pattern */}
<div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#aac7ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
{/* Mock Nodes and Edges Container */}
<div className="absolute inset-0 z-10">
{/* SVG for Edges */}
<svg className="absolute inset-0 w-full h-full pointer-events-none">
{/* Money Path */}
<path className="anim-line-cyan" d="M 350 200 Q 450 150 550 250" fill="none"></path>
{/* Criminal Path */}
<path className="anim-line-red" d="M 550 250 Q 600 350 500 450" fill="none"></path>
{/* Standard Path */}
<path d="M 550 250 L 700 200" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"></path>
<path d="M 350 200 L 250 300" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"></path>
<path d="M 500 450 L 350 400" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"></path>
</svg>
{/* Crime Cluster Glow */}
<div className="cluster-glow w-[300px] h-[300px]" style={{ top: '150px', left: '400px' }}>
<div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-error/10 border border-error/30 text-error px-sm py-xs rounded text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm">Money Laundering Ring Alpha</div>
</div>
{/* Nodes */}
{/* Bank Account */}
<div className="absolute w-12 h-12 node-hexagon node-neon-warning flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{ top: '176px', left: '326px' }} title="Offshore Account XYZ">
<span className="material-symbols-outlined text-tertiary text-[20px]">account_balance</span>
</div>
{/* Selected Suspect Node (Rahul Varma) */}
<div className="absolute w-14 h-14 node-circle node-neon-danger flex items-center justify-center cursor-pointer ring-4 ring-error/40 shadow-2xl z-20" style={{ top: '226px', left: '526px' }}>
<img className="w-full h-full object-cover rounded-full opacity-80 mix-blend-luminosity" data-alt="A highly detailed, modern flat vector illustration of a male suspect in profile. Dark background, glowing red and cyan neon rim lighting outlining his features. Cyberpunk investigative aesthetic, minimalist but high-tech." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQgPKekTMkV5TTbUGAxo101vSsRAUIxxF8Wlm53cHk-ZYvxN0HWFPOtDvOOG4ve9FFZ8g49rFQ9FVAm1s-LMP_zc8_XFIRiMbZitzriLdHUuDtKkN8733CEkmgust7Oq3JYJAwN94nmCe70IWqzKMYLpZpefSZruTgtqjGVu5-b_3dlyfVTPg6e32tz5vah1KYToHwdbTAUCwtZzUKfssZs401Fx9vLAYsgOEjJVHeczaYgC0cWhXx1QiOjE0dKIFwpRkKx3veko8"/>
<div className="absolute -bottom-6 whitespace-nowrap bg-surface/80 px-xs rounded border border-outline-variant font-label-sm text-label-sm text-on-surface backdrop-blur-sm">Rahul Varma</div>
</div>
{/* Vehicle */}
<div className="absolute w-10 h-10 node-square node-neon-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{ top: '180px', left: '680px' }} title="Registered SUV">
<span className="material-symbols-outlined text-primary text-[18px]">directions_car</span>
</div>
{/* Associate Suspect */}
<div className="absolute w-10 h-10 node-circle node-neon-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{ top: '430px', left: '480px' }}>
<span className="material-symbols-outlined text-primary text-[18px]">person</span>
</div>
{/* Location */}
<div className="absolute w-8 h-8 rounded-full bg-surface-variant border border-outline flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg" style={{ top: '284px', left: '234px' }}>
<span className="material-symbols-outlined text-on-surface-variant text-[16px]">location_on</span>
</div>
</div>
{/* Floating Graph Controls */}
<div className="absolute bottom-xl left-1/2 -translate-x-1/2 flex items-center gap-xs glass-panel p-xs rounded-full z-30 shadow-2xl">
<button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors" title="Zoom Out">
<span className="material-symbols-outlined text-[18px]">remove</span>
</button>
<span className="font-label-sm text-label-sm text-on-surface-variant px-xs">100%</span>
<button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors" title="Zoom In">
<span className="material-symbols-outlined text-[18px]">add</span>
</button>
<div className="w-px h-4 bg-white/20 mx-xs"></div>
<button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors" title="Recenter">
<span className="material-symbols-outlined text-[18px]">my_location</span>
</button>
<button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors" title="Export Graph">
<span className="material-symbols-outlined text-[18px]">download</span>
</button>
</div>
{/* Bottom Developer Card */}
<div className="absolute bottom-sm right-sm text-[10px] text-on-surface-variant/50 font-mono flex items-center gap-xs z-30 pointer-events-none">
<span className="material-symbols-outlined text-[12px]">code</span>
                    Rendered via React Flow • Neo4j Integration Active
                </div>
</section>
{/* Column 3: Right Inspector Panel */}
<aside className="w-80 glass-panel border-l border-t-0 border-b-0 border-r-0 flex flex-col z-20 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
{/* Header */}
<div className="p-md flex items-start justify-between border-b border-white/10 bg-surface/40">
<div className="flex items-center gap-md">
<div className="w-12 h-12 rounded-full border-2 border-error p-[2px] shrink-0">
<img className="w-full h-full object-cover rounded-full grayscale opacity-80" data-alt="A highly detailed, modern flat vector illustration of a male suspect in profile. Dark background, glowing red and cyan neon rim lighting outlining his features. Cyberpunk investigative aesthetic, minimalist but high-tech." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5rl9-S0hydlwrpL0wqI61LNlV3cmzDBlEVZKpXSoeAJxNw9b6EbeNWcdoBPy4dBlvVztHP9VcZi73xq826Clrbkpk1bYCJJcw6FyCFfIsZB66006MrpHl9WRpX2GICtzO4W39H8Cj28_ns8wJP4Rm5w10F-8VZdv-ElylqkizQ1eYBe-IZk_b1MYCHvOG9l2HGEAAaKcLsEUnUCgCh3R0M0dHWxVhXHfV3IenivQS6GaCKxgLVc99q1IQnmS8hQeoFvqROiDQV78"/>
</div>
<div>
<h2 className="font-headline-md text-headline-md text-on-surface leading-tight">Rahul Varma</h2>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-error/10 text-error font-label-sm text-label-sm border border-error/20 mt-xs">Target Suspect</span>
</div>
</div>
<button className="text-on-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
{/* Scrollable Content */}
<div className="flex-1 overflow-y-auto p-md space-y-lg">
{/* Risk Score Bento Box */}
<div className="bg-surface-container-low rounded-xl p-md border border-outline-variant/50 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-24 h-24 bg-error/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
<h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[14px]">warning</span> Threat Assessment
                        </h4>
<div className="flex items-end gap-sm">
<span className="font-display-lg text-display-lg text-error leading-none">92</span>
<span className="font-body-md text-body-md text-on-surface-variant pb-1">/100</span>
</div>
<div className="mt-sm h-1 w-full bg-surface-variant rounded-full overflow-hidden">
<div className="h-full bg-error rounded-full w-[92%] shadow-[0_0_10px_rgba(255,180,171,0.5)]"></div>
</div>
</div>
{/* Associated Crimes */}
<div>
<h4 className="font-label-md text-label-md text-primary mb-sm tracking-wider uppercase">Associated Crimes</h4>
<div className="flex flex-wrap gap-xs">
<span className="px-sm py-1 bg-surface-variant border border-outline-variant rounded font-label-sm text-label-sm text-on-surface">Money Laundering</span>
<span className="px-sm py-1 bg-surface-variant border border-outline-variant rounded font-label-sm text-label-sm text-on-surface">Digital Arrest Scams</span>
<span className="px-sm py-1 bg-surface-variant border border-outline-variant rounded font-label-sm text-label-sm text-on-surface">Wire Fraud</span>
</div>
</div>
{/* Evidence Gallery */}
<div>
<h4 className="font-label-md text-label-md text-primary mb-sm tracking-wider uppercase flex items-center justify-between">
                            Evidence Gallery
                            <span className="text-on-surface-variant font-normal lowercase text-[10px]">3 files</span>
</h4>
<div className="grid grid-cols-3 gap-xs">
<div className="aspect-square bg-surface-container rounded-lg border border-outline-variant/50 overflow-hidden relative group cursor-pointer">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="A macro shot of a forged passport document under a blue UV light, revealing hidden security threads. High contrast, dark cinematic lighting, intelligence briefing style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX17YxOE8Kz6QRcF5mzV3TdoVNvYUT_h224hg3NOv_oa_yWkuwo78Amu-CTZ9xNBt_D0g9Df58jGbjwykwxE468t4RGzpcrZNHO8USnG31O-0A_K6tN9rY0OBA_QU3QPjfOqdzVqrvh9dbdjidhjP2JWVuN59Yn0-9peFJQ7Pn6R_A62tYXjfnqJrPl2BweOSMV0QmZQfo0auCfqJE6WCN41cxrzVNznGlxUAM1zrn3ZUVFlxK1nka1srup4TrJjm--AZ-su9A6YU"/>
<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[20px]">visibility</span>
</div>
</div>
<div className="aspect-square bg-surface-container rounded-lg border border-outline-variant/50 overflow-hidden relative group cursor-pointer">
<img className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="A dark screen displaying lines of complex financial transaction logs in neon green terminal text. Cyber security aesthetic, highly detailed, sharp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEP7Kgk6h7rS0mZrMvgKbyhhyxv1TCjwC67P2h7XT9DIWvK-POYENoYORfBN4XT5Anz_rPI1jlMfxY8mdpZUzQQetnJQDEUVkxU4arkA-v3fkcLaqrs72hyqiNYfrhMavpCm7jAzljg5_XVf8oOTr43khBMa-cFmvO84_IvnbY8Byej3ZxcOoycd65QQHrAD9IG_AZCRiHk2Ocdnd87OW_pj92qQgUkW_XzPe77rBMxR7truFyttp8rpEWtCP8NNrdMjYQ0m-J3GY"/>
<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span className="material-symbols-outlined text-white text-[20px]">visibility</span>
</div>
</div>
<div className="aspect-square bg-surface-container rounded-lg border border-outline-variant/50 overflow-hidden relative group cursor-pointer flex items-center justify-center">
<span className="material-symbols-outlined text-on-surface-variant text-[24px]">description</span>
</div>
</div>
</div>
</div>
{/* Action Buttons Footer */}
<div className="p-md border-t border-white/10 bg-surface-container-low/80 mt-auto space-y-sm">
<button className="w-full bg-error/10 border border-error text-error py-sm rounded-lg font-label-md text-label-md hover:bg-error/20 transition-colors flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(255,180,171,0.1)]">
<span className="material-symbols-outlined text-[18px]">gavel</span>
                        Issue Warrant
                    </button>
<button className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-xs shadow-[0_0_10px_rgba(170,199,255,0.2)]">
<span className="material-symbols-outlined text-[18px]">radar</span>
                        Deploy Surveillance
                    </button>
</div>
</aside>
</main>
</div>

    </>
  );
}
