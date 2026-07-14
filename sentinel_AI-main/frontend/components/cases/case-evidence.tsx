"use client";

import { CaseEvidence as CaseEvidenceType } from "@/lib/services/caseService";
import { format } from "date-fns";
import { FileText, Image as ImageIcon, Link as LinkIcon, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseEvidenceProps {
  evidence: CaseEvidenceType[];
}

export function CaseEvidence({ evidence }: CaseEvidenceProps) {
  if (!evidence || evidence.length === 0) {
    return <div className="text-sm text-muted-foreground py-4">No evidence attached to this case.</div>;
  }

  const getIconForType = (type: CaseEvidenceType["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      case "link":
        return <LinkIcon className="h-8 w-8 text-purple-500" />;
      case "document":
      default:
        return <FileText className="h-8 w-8 text-orange-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {evidence.map((item) => (
        <div key={item.id} className="group relative flex flex-col items-center justify-center p-4 border rounded-xl bg-card hover:border-primary/50 transition-colors">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {item.type === "link" ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mb-3 p-3 bg-muted rounded-full">
            {getIconForType(item.type)}
          </div>
          <h4 className="text-sm font-medium text-center line-clamp-1 w-full" title={item.title}>
            {item.title}
          </h4>
          <span className="text-xs text-muted-foreground mt-1">
            {format(new Date(item.dateAdded), "MMM d, yyyy")}
          </span>
        </div>
      ))}
    </div>
  );
}
