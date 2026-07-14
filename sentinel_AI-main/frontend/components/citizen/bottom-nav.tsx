"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CitizenBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/citizen', label: 'Home', icon: Home },
    { href: '/citizen/report', label: 'Report', icon: MessageSquare },
    { href: '/citizen/status', label: 'Status', icon: Clock },
    { href: '/citizen/stations', label: 'Stations', icon: MapPin },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-surface-container-highest/90 backdrop-blur-2xl border-t border-outline/10 px-6 py-3 pb-safe z-50 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-transform active:scale-95 w-16 h-14 rounded-xl",
              isActive ? "text-primary bg-primary/10" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Icon className={cn("mb-1", isActive ? "h-6 w-6" : "h-5 w-5")} />
            <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-on-surface-variant")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
