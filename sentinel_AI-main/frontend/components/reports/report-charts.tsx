"use client";

import React from 'react';

export function ReportCharts() {
  const data = [
    { label: 'Phishing', value: 85, color: '#000000' },
    { label: 'Identity Theft', value: 45, color: '#555555' },
    { label: 'Financial Fraud', value: 65, color: '#888888' },
    { label: 'Extortion', value: 25, color: '#BBBBBB' }
  ];

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="mb-8 page-break-inside-avoid">
      <h3 className="font-serif text-lg font-bold border-b border-black/20 pb-2 mb-4 text-black">Quantitative Analysis</h3>
      
      <div className="flex flex-col gap-4 p-4 border border-black/10 bg-gray-50 rounded">
        <h4 className="text-sm font-semibold text-black/80 mb-2">Reported Incidents by Type (Sector 7)</h4>
        
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="w-32 text-xs font-medium text-black text-right">{item.label}</span>
            <div className="flex-1 h-6 bg-gray-200 border border-black/10 flex items-center">
              <div 
                className="h-full border-r border-black/20 print-exact"
                style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }}
              ></div>
            </div>
            <span className="w-12 text-xs font-mono text-black font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
