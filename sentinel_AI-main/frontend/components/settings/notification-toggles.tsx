"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function NotificationToggles() {
  const [config, setConfig] = useState({
    critical: { email: true, sms: true, push: true },
    high: { email: true, sms: false, push: true },
    medium: { email: false, sms: false, push: true },
    low: { email: false, sms: false, push: false },
  });

  const handleToggle = (severity: 'critical' | 'high' | 'medium' | 'low', channels: 'email' | 'sms' | 'push') => {
    setConfig(prev => ({
      ...prev,
      [severity]: {
        ...prev[severity],
        [channels]: !prev[severity][channels],
      }
    }));
  };

  const handleSave = () => {
    alert('Alert notification dispatch rules updated.');
  };

  const categories: { id: 'critical' | 'high' | 'medium' | 'low', label: string, desc: string }[] = [
    { id: 'critical', label: 'Critical Threats', desc: 'Active attacks, server intrusion events, and emergency SOS alerts.' },
    { id: 'high', label: 'High Priority Events', desc: 'Severe fraud waves, suspicious node links, and open-case assignments.' },
    { id: 'medium', label: 'Medium Anomalies', desc: 'Unusual digital transaction frequency or isolated login anomalies.' },
    { id: 'low', label: 'Low Level Reports', desc: 'Minor complaints, system updates, and daily routine summaries.' },
  ];

  return (
    <Card className="bg-surface-container border-outline/10 text-on-surface">
      <CardHeader>
        <CardTitle className="text-xl">Dispatch & Alert Notifications</CardTitle>
        <CardDescription className="text-on-surface-variant">Manage how critical alerts are dispatched to your communication channels.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-outline/10 last:border-b-0 last:pb-0">
            <div className="max-w-md">
              <h4 className="font-semibold text-base">{cat.label}</h4>
              <p className="text-sm text-on-surface-variant mt-1">{cat.desc}</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto justify-start md:justify-end">
              {/* Push Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={config[cat.id].push}
                  onChange={() => handleToggle(cat.id, 'push')}
                  className="rounded border-outline/20 bg-surface text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">Push</span>
              </label>

              {/* Email Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={config[cat.id].email}
                  onChange={() => handleToggle(cat.id, 'email')}
                  className="rounded border-outline/20 bg-surface text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">Email</span>
              </label>

              {/* SMS Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={config[cat.id].sms}
                  onChange={() => handleToggle(cat.id, 'sms')}
                  className="rounded border-outline/20 bg-surface text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">SMS</span>
              </label>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="border-t border-outline/10 pt-4 flex justify-end gap-2">
        <Button variant="ghost">Reset</Button>
        <Button onClick={handleSave}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
}
