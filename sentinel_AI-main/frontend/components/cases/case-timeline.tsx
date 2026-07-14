"use client";

import { CaseTimelineEvent } from "@/lib/services/caseService";
import { format } from "date-fns";
import { CircleDot, FileText, UserPlus, AlertTriangle } from "lucide-react";

interface CaseTimelineProps {
  events: CaseTimelineEvent[];
}

export function CaseTimeline({ events }: CaseTimelineProps) {
  const getIconForType = (type: CaseTimelineEvent["type"]) => {
    switch (type) {
      case "status_change":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "evidence_added":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "assignment":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case "note":
      default:
        return <CircleDot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!events || events.length === 0) {
    return <div className="text-sm text-muted-foreground py-4">No timeline events available.</div>;
  }

  // Sort events newest first
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative border-l border-muted ml-3 mt-4 space-y-6 pb-4">
      {sortedEvents.map((event) => (
        <div key={event.id} className="relative pl-6">
          <span className="absolute -left-[11px] top-1 bg-background rounded-full border p-1 shadow-sm">
            {getIconForType(event.type)}
          </span>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{event.title}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(event.date), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <span className="text-xs font-medium text-primary mt-1">
              by {event.actor}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
