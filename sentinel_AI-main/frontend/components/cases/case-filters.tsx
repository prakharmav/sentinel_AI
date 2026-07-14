"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { CaseStatus, CasePriority } from "@/lib/services/caseService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaseFiltersProps {
  onSearch: (query: string) => void;
  onStatusChange: (status: CaseStatus | "All") => void;
  onPriorityChange: (priority: CasePriority | "All") => void;
}

export function CaseFilters({
  onSearch,
  onStatusChange,
  onPriorityChange,
}: CaseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 w-full">
      <div className="flex flex-1 items-center space-x-2 w-full max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases..."
            className="pl-9 w-full bg-background"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Select onValueChange={(value: string) => onStatusChange(value as CaseStatus | "All")} defaultValue="All">
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value: string) => onPriorityChange(value as CasePriority | "All")} defaultValue="All">
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" title="More Filters">
          <Filter className="h-4 w-4" />
        </Button>
        <Button className="hidden sm:flex" variant="default">
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>
    </div>
  );
}
