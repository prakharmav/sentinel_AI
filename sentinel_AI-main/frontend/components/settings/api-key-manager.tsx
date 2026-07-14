"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check, Trash } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production Sentinel Dispatcher', key: 'sn_live_8f93...4b61', created: '2023-09-12' },
    { id: '2', name: 'Dev Test Environment', key: 'sn_test_da23...9a8d', created: '2023-10-01' },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: `Integrator Key ${keys.length + 1}`,
      key: `sn_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      created: new Date().toISOString().split('T')[0],
    };
    setKeys(prev => [...prev, newKey]);
  };

  const handleCopy = (id: string, fullKey: string) => {
    navigator.clipboard.writeText(fullKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API access key?')) {
      setKeys(prev => prev.filter(k => k.id !== id));
    }
  };

  return (
    <Card className="bg-surface-container border-outline/10 text-on-surface">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl">API Keys & Role Permissions</CardTitle>
          <CardDescription className="text-on-surface-variant">Generate system API integration tokens. Active role: <strong className="text-primary">Super Administrator</strong>.</CardDescription>
        </div>
        <Button size="sm" onClick={handleGenerateKey} className="gap-2 shrink-0">
          <Key className="h-4 w-4" />
          <span>New Key</span>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border border-outline/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline/10 text-on-surface-variant">
                <th className="p-3 font-semibold">Key Identifier</th>
                <th className="p-3 font-semibold">Token Value</th>
                <th className="p-3 font-semibold hidden sm:table-cell">Created</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length > 0 ? (
                keys.map((k) => (
                  <tr key={k.id} className="border-b border-outline/10 last:border-b-0 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium">{k.name}</td>
                    <td className="p-3 font-mono text-xs text-on-surface-variant">{k.key}</td>
                    <td className="p-3 text-on-surface-variant hidden sm:table-cell">{k.created}</td>
                    <td className="p-3 text-right flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-on-surface-variant"
                        onClick={() => handleCopy(k.id, k.key)}
                      >
                        {copiedId === k.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-error hover:bg-error/10 hover:text-error"
                        onClick={() => handleRevoke(k.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-on-surface-variant">No active integration keys found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
