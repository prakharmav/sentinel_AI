"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout';
import { 
  SettingsNav, 
  SettingsSection,
  ProfileForm,
  SecurityPanel,
  NotificationToggles,
  SystemPreferences,
  ApiKeyManager,
  AuditLogTable
} from '@/components/settings';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileForm />;
      case 'security':
        return <SecurityPanel />;
      case 'notifications':
        return <NotificationToggles />;
      case 'preferences':
        return <SystemPreferences />;
      case 'keys':
        return <ApiKeyManager />;
      case 'logs':
        return <AuditLogTable />;
      default:
        return <ProfileForm />;
    }
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Navigation Column */}
          <div className="w-full md:w-64 shrink-0">
            <SettingsNav 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
          </div>

          {/* Configuration Form Column */}
          <div className="flex-1 w-full min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
