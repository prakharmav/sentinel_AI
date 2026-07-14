"use client";

import React from 'react';

export function DocumentPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-dim/30 p-4 sm:p-8 flex justify-center print:p-0 print:bg-white print:block">
      <div className="bg-white text-black w-full max-w-[850px] min-h-[1100px] shadow-2xl print:shadow-none print:w-full print:max-w-none print:min-h-0 mx-auto border border-outline/20">
        <div className="p-8 sm:p-12 md:p-16 flex flex-col gap-8 h-full">
          {children}
        </div>
      </div>
      
      {/* Print-specific overrides to ensure dark mode text doesn't bleed into print */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
