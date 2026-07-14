"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Share2, FileText } from 'lucide-react';

export function ReportToolbar() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface border-b border-outline/10 print:hidden sticky top-0 z-40 shadow-sm backdrop-blur-md bg-surface/80">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="font-headline-sm font-semibold tracking-tight text-on-surface">Investigation Report Viewer</h2>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </Button>
        <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2">
          <Download className="h-4 w-4" />
          <span>Export PDF</span>
        </Button>
        <Button variant="default" size="sm" className="flex-1 sm:flex-none gap-2 bg-primary text-on-primary">
          <Share2 className="h-4 w-4" />
          <span>Share Securely</span>
        </Button>
      </div>
    </div>
  );
}
