"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

export function SecurityPanel() {
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.next !== password.confirm) {
      alert('New passwords do not match.');
      return;
    }
    alert('Administrative credentials updated successfully.');
    setPassword({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      {/* MFA Configuration */}
      <Card className="bg-surface-container border-outline/10 text-on-surface">
        <CardHeader>
          <CardTitle className="text-xl">Two-Factor Authentication (2FA)</CardTitle>
          <CardDescription className="text-on-surface-variant">Secure your command dashboard login using multi-factor confirmation steps.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${mfaEnabled ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
              {mfaEnabled ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <div>
              <h4 className="font-semibold text-base">{mfaEnabled ? 'MFA Protection Active' : 'MFA Protection Disabled'}</h4>
              <p className="text-sm text-on-surface-variant mt-1">Authenticating requires biometric hardware or TOTP applications.</p>
            </div>
          </div>
          <Button 
            variant={mfaEnabled ? 'outline' : 'default'}
            onClick={() => setMfaEnabled(!mfaEnabled)}
          >
            {mfaEnabled ? 'Disable' : 'Enable'}
          </Button>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card className="bg-surface-container border-outline/10 text-on-surface">
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription className="text-on-surface-variant">Update your account authentication password periodically to comply with security protocols.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Current Password</label>
              <Input 
                type="password" 
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="bg-surface border-outline/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">New Password</label>
              <Input 
                type="password" 
                value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })}
                className="bg-surface border-outline/20"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Confirm New Password</label>
              <Input 
                type="password" 
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="bg-surface border-outline/20"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-outline/10 pt-4 flex justify-end gap-2">
            <Button type="submit" className="gap-2">
              <KeyRound className="h-4 w-4" />
              <span>Update Password</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
