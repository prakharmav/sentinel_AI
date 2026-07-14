"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function SystemPreferences() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en-US');

  const handleSave = () => {
    alert(`System theme set to: ${theme}. Language updated to: ${language}.`);
  };

  return (
    <Card className="bg-surface-container border-outline/10 text-on-surface">
      <CardHeader>
        <CardTitle className="text-xl">Theme & Language Preferences</CardTitle>
        <CardDescription className="text-on-surface-variant">Customize user interface colors and system language options.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Active Theme</label>
          <Select onValueChange={setTheme} defaultValue={theme}>
            <SelectTrigger className="bg-surface border-outline/20">
              <SelectValue placeholder="Select Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Sentinel Dark (Default)</SelectItem>
              <SelectItem value="government">Government Blue</SelectItem>
              <SelectItem value="light">Sentinel Light</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-on-surface-variant">Changes will reflect instantly upon saving.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface-variant">Language (Locale)</label>
          <Select onValueChange={setLanguage} defaultValue={language}>
            <SelectTrigger className="bg-surface border-outline/20">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
              <SelectItem value="fr-FR">Français</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-on-surface-variant">System reporting output files will adapt to this locale.</p>
        </div>
      </CardContent>

      <CardFooter className="border-t border-outline/10 pt-4 flex justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </CardFooter>
    </Card>
  );
}
