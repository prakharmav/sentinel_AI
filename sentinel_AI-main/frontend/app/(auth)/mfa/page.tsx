"use client";

import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-surface p-6">
      <h1 className="text-3xl font-bold mb-4">Multi-Factor Authentication verify challenge</h1>
      <p className="text-on-surface-variant mb-6">This section is currently linked to mock data and is active.</p>
      <Link href="/dashboard" className="px-4 py-2 bg-primary text-on-primary rounded hover:bg-primary-container transition">
        Return to Command Center Dashboard
      </Link>
    </div>
  );
}
