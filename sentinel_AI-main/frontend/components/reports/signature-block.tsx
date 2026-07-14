"use client";

import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';

export function SignatureBlock() {
  return (
    <div className="mt-12 pt-8 border-t-2 border-black/80 flex justify-between items-end page-break-inside-avoid">
      <div className="flex flex-col gap-2">
        <p className="font-sans text-sm text-black">Prepared By:</p>
        <div className="h-16 w-48 border-b border-black border-dashed flex items-end pb-1">
          <span className="font-signature text-2xl text-blue-900 italic ml-4">J. Doe</span>
        </div>
        <p className="font-serif text-sm font-bold text-black uppercase">Det. John Doe</p>
        <p className="font-sans text-xs text-black/70">Badge #89422</p>
      </div>

      <div className="flex flex-col items-center gap-2 border border-black/20 p-4 bg-gray-50 rounded">
        <BadgeCheck className="h-8 w-8 text-green-700" />
        <p className="font-mono text-[10px] text-black font-bold uppercase">Cryptographically Signed</p>
        <p className="font-mono text-[8px] text-black/60">Hash: 0x8F92...3A1F</p>
        <p className="font-mono text-[8px] text-black/60">TS: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')} UTC</p>
      </div>
    </div>
  );
}
