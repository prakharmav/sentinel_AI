"use client";

import { Case } from "@/lib/services/caseService";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseTimeline } from "./case-timeline";
import { CaseEvidence } from "./case-evidence";
import { MapPin, Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";

interface CaseDrawerProps {
  caseData: Case | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CaseDrawer({ caseData, isOpen, onClose }: CaseDrawerProps) {
  if (!caseData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between mt-6 pr-8">
            <SheetTitle className="text-xl">{caseData.title}</SheetTitle>
            <div className="flex gap-2">
              <Badge variant={caseData.priority === "Critical" ? "destructive" : "secondary" as any}>
                {caseData.priority}
              </Badge>
              <Badge variant="outline">{caseData.status}</Badge>
            </div>
          </div>
          <SheetDescription className="mt-2 text-sm text-muted-foreground">
            {caseData.id}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <p className="text-sm">{caseData.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{caseData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{caseData.assignee}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(caseData.dateOpened), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Updated {format(new Date(caseData.lastUpdated), "h:mm a")}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="timeline" className="mt-8">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-6">
            <h3 className="text-sm font-semibold mb-4">Case History</h3>
            <CaseTimeline events={caseData.timeline} />
          </TabsContent>
          
          <TabsContent value="evidence" className="mt-6">
            <h3 className="text-sm font-semibold mb-4">Attached Evidence</h3>
            <CaseEvidence evidence={caseData.evidence} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
