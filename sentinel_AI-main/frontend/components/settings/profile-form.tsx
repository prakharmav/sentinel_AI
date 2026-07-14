"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Shield, Camera } from 'lucide-react';

export function ProfileForm() {
  const [profile, setProfile] = useState({
    name: 'Det. Sarah Jenkins',
    email: 's.jenkins@sentinelai.gov',
    designation: 'Lead Threat Analyst',
    department: 'Cyber Threat Investigation',
    badge: 'BADGE-48291',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save simulation
    alert('Profile configuration updated successfully.');
  };

  return (
    <Card className="bg-surface-container border-outline/10 text-on-surface">
      <CardHeader>
        <CardTitle className="text-xl">Profile Information</CardTitle>
        <CardDescription className="text-on-surface-variant">Update your administrative profile details and badge registration.</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSave}>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-surface-container-high border border-outline/20 flex items-center justify-center overflow-hidden group">
              <span className="text-2xl font-bold text-primary">SJ</span>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-base">Profile Photograph</h4>
              <p className="text-sm text-on-surface-variant mt-1">PNG, JPG format up to 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
              <Input 
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-surface border-outline/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Email Address</label>
              <Input 
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-surface border-outline/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Designation</label>
              <Input 
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                className="bg-surface border-outline/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant">Department</label>
              <Input 
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="bg-surface border-outline/20"
              />
            </div>

            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-sm font-semibold text-on-surface-variant">Badge Registration Number</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
                <Input 
                  value={profile.badge}
                  disabled
                  className="bg-surface border-outline/20 pl-10 cursor-not-allowed text-on-surface-variant opacity-75"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-outline/10 pt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost">Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
