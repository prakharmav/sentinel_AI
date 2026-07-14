"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  ip: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Pending';
}

export function AuditLogTable() {
  const [logs] = useState<AuditLog[]>([
    { id: '1', action: 'API Key Generated - Sentinel Dispatcher', user: 'Jenkins S. (Super Admin)', ip: '192.168.1.144', timestamp: '2023-10-26 14:15:22', status: 'Success' },
    { id: '2', action: 'MFA Configuration Disabled', user: 'Jenkins S. (Super Admin)', ip: '192.168.1.144', timestamp: '2023-10-26 13:00:10', status: 'Success' },
    { id: '3', action: 'Failed Login Attempt', user: 'admin_test', ip: '203.0.113.50', timestamp: '2023-10-25 09:44:12', status: 'Failed' },
    { id: '4', action: 'Case CAS-2023-0891 Assigned', user: 'System Auto-Route', ip: 'Localhost', timestamp: '2023-10-25 08:30:00', status: 'Success' },
  ]);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase()) ||
    log.ip.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="bg-surface-container border-outline/10 text-on-surface">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Security Audit Logs</CardTitle>
          <CardDescription className="text-on-surface-variant">Trace administrative events, login histories, and policy changes.</CardDescription>
        </div>
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter logs..."
          className="bg-surface border-outline/20 w-full sm:max-w-xs"
        />
      </CardHeader>
      
      <CardContent>
        <div className="border border-outline/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline/10 text-on-surface-variant">
                <th className="p-3 font-semibold">Event</th>
                <th className="p-3 font-semibold">User / System</th>
                <th className="p-3 font-semibold hidden md:table-cell">IP Address</th>
                <th className="p-3 font-semibold hidden sm:table-cell">Timestamp</th>
                <th className="p-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-outline/10 last:border-b-0 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium">{log.action}</td>
                    <td className="p-3 text-on-surface-variant">{log.user}</td>
                    <td className="p-3 font-mono text-xs text-on-surface-variant hidden md:table-cell">{log.ip}</td>
                    <td className="p-3 text-on-surface-variant hidden sm:table-cell">{log.timestamp}</td>
                    <td className="p-3 text-right">
                      <Badge variant={log.status === 'Success' ? 'success' as any : 'destructive'}>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-on-surface-variant">No matching event logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
