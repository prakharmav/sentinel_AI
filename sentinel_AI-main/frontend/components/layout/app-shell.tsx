"use client";

import React from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex flex-col w-64 border-r bg-card h-full">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
