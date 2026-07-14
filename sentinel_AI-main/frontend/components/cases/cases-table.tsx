"use client";

import { useState } from "react";
import { Case } from "@/lib/services/caseService";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CasesTableProps {
  data: Case[];
  onRowClick: (caseItem: Case) => void;
}

export function CasesTable({ data, onRowClick }: CasesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const getStatusVariant = (status: Case["status"]) => {
    switch (status) {
      case "Active": return "destructive";
      case "Pending": return "warning"; // Assuming warning variant exists, else default
      case "Closed": return "success";  // Assuming success variant exists
      case "Archived": return "secondary";
      default: return "default";
    }
  };

  const getPriorityVariant = (priority: Case["priority"]) => {
    switch (priority) {
      case "Critical": return "destructive";
      case "High": return "destructive"; // Or another color
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Case ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="hidden md:table-cell">Assignee</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item) => (
                <TableRow 
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick(item)}
                >
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div className="truncate max-w-[200px] sm:max-w-[300px]">
                      {item.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status) as any}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(item.priority) as any}>
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {item.assignee}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {formatDistanceToNow(new Date(item.lastUpdated), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No cases found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {Math.min(startIndex + 1, data.length)} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} cases
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {Math.max(1, totalPages)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
