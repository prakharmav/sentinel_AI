"use client";

import React from 'react';
import { FileText, Search, UserCheck, CheckCircle2 } from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  date: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export function StatusTracker({ trackingId = "RPT-8422" }: { trackingId?: string }) {
  const events: TrackingEvent[] = [
    {
      id: '1',
      status: 'Report Filed',
      date: 'Oct 24, 10:30 AM',
      description: 'Your report was successfully submitted via the AI Assistant.',
      completed: true,
      active: false,
    },
    {
      id: '2',
      status: 'Under Initial Review',
      date: 'Oct 24, 11:15 AM',
      description: 'A dispatcher is currently reviewing your submitted evidence.',
      completed: true,
      active: false,
    },
    {
      id: '3',
      status: 'Assigned to Officer',
      date: 'Oct 24, 2:00 PM',
      description: 'Assigned to Officer L. Kim for further investigation.',
      completed: false,
      active: true,
    },
    {
      id: '4',
      status: 'Resolved',
      date: 'Pending',
      description: 'The case will be closed once the investigation concludes.',
      completed: false,
      active: false,
    }
  ];

  const getIcon = (index: number, completed: boolean, active: boolean) => {
    if (completed) return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (index === 0) return <FileText className="h-5 w-5 text-on-surface" />;
    if (index === 1) return <Search className="h-5 w-5 text-on-surface" />;
    if (index === 2) return <UserCheck className={`h-5 w-5 ${active ? 'text-primary animate-pulse' : 'text-on-surface-variant'}`} />;
    return <CheckCircle2 className="h-5 w-5 text-on-surface-variant" />;
  };

  return (
    <div className="bg-surface-container rounded-3xl p-6 border border-outline/10 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-sm font-bold text-on-surface">Tracking Status</h3>
        <span className="text-xs font-mono bg-surface-dim px-2 py-1 rounded text-primary border border-primary/20">
          {trackingId}
        </span>
      </div>

      <div className="relative border-l-2 border-outline/20 ml-3 space-y-8 pb-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            <span className={`absolute -left-[13px] top-0 bg-surface-container rounded-full border-2 p-1 ${event.completed ? 'border-success' : event.active ? 'border-primary' : 'border-outline/20'}`}>
              {getIcon(index, event.completed, event.active)}
            </span>
            <div className="flex flex-col">
              <span className={`font-semibold text-sm ${event.active ? 'text-primary' : 'text-on-surface'}`}>
                {event.status}
              </span>
              <span className="text-xs text-on-surface-variant mt-1 mb-2 font-medium">
                {event.date}
              </span>
              <p className="text-sm text-on-surface-variant">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
