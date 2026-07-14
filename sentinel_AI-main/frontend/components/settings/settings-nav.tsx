"use client";

import React from 'react';
import { User, Shield, Bell, Palette, Key, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SettingsSection = 'profile' | 'security' | 'notifications' | 'preferences' | 'keys' | 'logs';

interface SettingsNavProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  const menuItems = [
    { id: 'profile' as SettingsSection, label: 'Profile Settings', icon: User },
    { id: 'security' as SettingsSection, label: 'Security & 2FA', icon: Shield },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'preferences' as SettingsSection, label: 'Theme & Language', icon: Palette },
    { id: 'keys' as SettingsSection, label: 'API Keys & Permissions', icon: Key },
    { id: 'logs' as SettingsSection, label: 'Audit Logs', icon: ClipboardList },
  ];

  return (
    <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-outline/10 pr-0 md:pr-6 scrollbar-none w-full">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg whitespace-nowrap transition-all w-full text-left active:scale-[0.98]",
              isActive 
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
