"use client";

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Search, Link as LinkIcon, Smartphone, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ScamScanner() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'safe' | 'scam'>('idle');

  const handleScan = () => {
    if (!input.trim()) return;
    setStatus('scanning');
    
    // Simulate AI scanning
    setTimeout(() => {
      if (input.toLowerCase().includes('free money') || input.toLowerCase().includes('urgent')) {
        setStatus('scam');
      } else {
        setStatus('safe');
      }
    }, 1500);
  };

  return (
    <div className="bg-surface-container rounded-3xl p-6 border border-outline/10 shadow-sm flex flex-col gap-4">
      <div>
        <h3 className="font-headline-sm font-bold text-on-surface mb-1 flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Scam Scanner
        </h3>
        <p className="text-sm text-on-surface-variant">
          Paste a suspicious link, SMS, or phone number to verify it using SentinelAI.
        </p>
      </div>

      <div className="flex gap-2">
        <Input 
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus('idle');
          }}
          placeholder="e.g. http://suspicious-link.com" 
          className="bg-surface border-outline/20"
        />
        <Button onClick={handleScan} disabled={status === 'scanning'} className="px-6">
          {status === 'scanning' ? (
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : 'Scan'}
        </Button>
      </div>

      <div className="flex justify-around py-2 border-t border-outline/10 mt-2 text-on-surface-variant">
        <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
          <LinkIcon className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">URL</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
          <Smartphone className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">SMS / Call</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
          <FileImage className="h-5 w-5" />
          <span className="text-[10px] uppercase font-bold tracking-wider">Screenshot</span>
        </button>
      </div>

      {status === 'safe' && (
        <div className="mt-2 bg-success/10 border border-success/30 rounded-xl p-4 flex gap-3">
          <ShieldCheck className="h-6 w-6 text-success shrink-0" />
          <div>
            <h4 className="font-semibold text-success text-sm">Appears Safe</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              SentinelAI found no known threats associated with this input. However, always exercise caution.
            </p>
          </div>
        </div>
      )}

      {status === 'scam' && (
        <div className="mt-2 bg-error/10 border border-error/30 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="h-6 w-6 text-error shrink-0" />
          <div>
            <h4 className="font-semibold text-error text-sm">High Risk Detected</h4>
            <p className="text-xs text-on-surface-variant mt-1">
              This input matches known phishing patterns or fraudulent databases. Do not interact.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full border-error/50 text-error hover:bg-error/20">
              Report this Scam
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
