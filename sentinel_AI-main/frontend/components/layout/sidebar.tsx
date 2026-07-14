"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Search, Shield, Users, Database, FileText, Settings, Network, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/analytics', label: 'Analytics', icon: Activity },
    { href: '/cases', label: 'Cases', icon: Briefcase },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/network', label: 'Network Graph', icon: Network },
    { href: '/query', label: 'AI Assistant', icon: Search },
    { href: '/police', label: 'Dispatch', icon: Shield },
    { href: '/citizen', label: 'Citizen Portal', icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-surface-dim border-r border-outline/10 text-on-surface">
      <div className="flex items-center gap-2 p-6 border-b border-outline/10">
        <Shield className="h-8 w-8 text-primary" />
        <span className="font-headline-sm font-bold tracking-tight text-primary">SentinelAI</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-label-lg",
                isActive 
                  ? "bg-primary text-on-primary shadow-[0_4px_14px_rgba(var(--color-primary-rgb),0.3)]" 
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-outline/10">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all font-label-lg"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}