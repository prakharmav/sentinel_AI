"use client";

import React from 'react';
import { CitizenBottomNav } from '@/components/citizen';
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Mobile Top Header */}
      <header className="flex-none h-16 bg-surface-dim/90 backdrop-blur-md border-b border-outline/10 flex justify-between items-center px-4 z-40">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-headline-sm font-bold tracking-tight text-primary">SentinelCitizen</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-surface-container hover:bg-surface-container-high">
          <User className="h-5 w-5 text-on-surface" />
        </Button>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto pb-24 sm:pb-8 relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden block">
        <CitizenBottomNav />
      </div>
    </div>
  );
}
