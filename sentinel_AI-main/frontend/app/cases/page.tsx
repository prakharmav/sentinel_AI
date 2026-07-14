"use client";

import { useEffect, useState, useMemo } from "react";
import { Case, getCases, CaseStatus, CasePriority } from "@/lib/services/caseService";
import { CaseFilters, CasesTable, CaseDrawer } from "@/components/cases";
import { AppShell } from "@/components/layout";
import { motion } from "framer-motion";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | "All">("All");

  // Drawer state
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      const data = await getCases();
      setCases(data);
      setLoading(false);
    };
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, searchQuery, statusFilter, priorityFilter]);

  const handleRowClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setIsDrawerOpen(true);
  };

  return (
    <AppShell>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <CaseFilters
            onSearch={setSearchQuery}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
          />

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full h-16 bg-muted/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : (
            <CasesTable 
              data={filteredCases} 
              onRowClick={handleRowClick} 
            />
          )}
        </motion.div>

        <CaseDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          caseData={selectedCase}
        />
      </div>
    </AppShell>
  );
}
