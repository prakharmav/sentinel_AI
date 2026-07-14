"use client";

import React from 'react';

export function PrintableTimeline() {
  const events = [
    { time: '08:00 AM', date: 'Oct 24, 2023', desc: 'Initial anomaly detected in Sector 7 financial nodes by SentinelAI.', actor: 'System' },
    { time: '09:15 AM', date: 'Oct 24, 2023', desc: 'Multiple civilian reports filed regarding suspicious SMS links.', actor: 'Public Intake' },
    { time: '11:30 AM', date: 'Oct 24, 2023', desc: 'Graph analysis confirmed 14 nodes linked to known offshore IPs.', actor: 'Analyst R. Cole' },
    { time: '02:45 PM', date: 'Oct 25, 2023', desc: 'Digital footprint traced; accounts frozen pending physical raid.', actor: 'Cyber Command' }
  ];

  return (
    <div className="mb-8">
      <h3 className="font-serif text-lg font-bold border-b border-black/20 pb-2 mb-4 text-black">Chronological Event Log</h3>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black/30 p-2 font-semibold text-black w-1/4">Date / Time</th>
            <th className="border border-black/30 p-2 font-semibold text-black w-1/2">Event Description</th>
            <th className="border border-black/30 p-2 font-semibold text-black w-1/4">Actor / Source</th>
          </tr>
        </thead>
        <tbody>
          {events.map((evt, i) => (
            <tr key={i} className="border-b border-black/20">
              <td className="border-l border-r border-black/30 p-2 text-black/80 font-mono text-xs">{evt.date}<br/>{evt.time}</td>
              <td className="border-r border-black/30 p-2 text-black/90">{evt.desc}</td>
              <td className="border-r border-black/30 p-2 text-black/80">{evt.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
