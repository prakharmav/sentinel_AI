"use client";

import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from '../ui/button';

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-outline/10 bg-surface-dim/80 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <span className="font-headline-sm font-bold tracking-tight text-primary">SentinelAI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-4 flex-1">
        {/* Placeholder for desktop breadcrumbs or global search */}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5 text-on-surface-variant" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error animate-pulse"></span>
        </Button>
        <Button variant="ghost" size="icon" className="ml-2">
          <User className="h-5 w-5 text-on-surface-variant" />
        </Button>
      </div>
    </header>
  );
}