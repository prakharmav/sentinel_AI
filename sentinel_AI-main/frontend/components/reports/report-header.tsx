"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { format } from 'date-fns';

export function ReportHeader() {
  return (
    <div className="flex flex-col border-b-2 border-black/80 pb-6 mb-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center bg-gray-100">
            <Shield className="h-8 w-8 text-black" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-black">SentinelAI Command</h1>
            <p className="font-serif text-sm tracking-widest text-black/70">Department of Threat Intelligence</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold text-black border border-black/20 px-2 py-1 bg-gray-50">CONFIDENTIAL</p>
          <p className="font-mono text-xs mt-2 text-black/70">ID: RPT-{Math.floor(Math.random() * 90000) + 10000}</p>
          <p className="font-mono text-xs text-black/70">Date: {format(new Date(), 'MMM dd, yyyy')}</p>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="font-serif text-xl font-bold uppercase underline underline-offset-4 text-black">Official Investigation Report</h2>
        <p className="font-sans text-sm mt-2 font-medium text-black/80">Subject: Coordinated Fraud Network (Sector 7)</p>
      </div>
    </div>
  );
}
