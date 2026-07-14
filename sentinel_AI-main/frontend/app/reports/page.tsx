"use client";

import React from "react";
import { AppShell } from "@/components/layout";
import {
  ReportToolbar,
  DocumentPreview,
  ReportHeader,
  PrintableTimeline,
  ReportCharts,
  SignatureBlock,
} from "@/components/reports";
import { motion } from "framer-motion";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-full bg-surface-dim/20">
        {/* Reports Toolbar */}
        <ReportToolbar />

        {/* Reports Document Workspace */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center print:p-0 print:bg-white print:block">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[850px]"
          >
            <DocumentPreview>
              {/* Document Header */}
              <ReportHeader />

              {/* Case Summary */}
              <section className="mb-8">
                <h3 className="font-serif text-lg font-bold border-b border-black/20 pb-2 mb-3 text-black">
                  1. Executive Summary
                </h3>
                <p className="text-sm leading-relaxed text-black/90 text-justify">
                  This document serves as the official threat investigation report compiled by SentinelAI in relation to the coordinated phishing and financial fraud activities detected across multiple systems in Sector 7. Deep graph analysis indicates active money trails moving through decentralized portals toward unverified offshore target accounts. Network traffic analysis reveals highly structured attack vectors exploiting local network gateways. Immediate mitigation strategies have been implemented, including credential revokation, node freezing, and routing isolation.
                </p>
              </section>

              {/* Investigation Timeline */}
              <section className="mb-8">
                <PrintableTimeline />
              </section>

              {/* Charts Section */}
              <section className="mb-8">
                <ReportCharts />
              </section>

              {/* Evidence Log */}
              <section className="mb-8 page-break-inside-avoid">
                <h3 className="font-serif text-lg font-bold border-b border-black/20 pb-2 mb-3 text-black">
                  4. Evidence Log
                </h3>
                <div className="border border-black/20 rounded overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-black/20">
                        <th className="p-2 font-semibold text-black border-r border-black/20 w-1/4">Evidence ID</th>
                        <th className="p-2 font-semibold text-black border-r border-black/20 w-1/2">Type / Reference</th>
                        <th className="p-2 font-semibold text-black w-1/4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-black/20">
                        <td className="p-2 text-black/80 font-mono text-xs border-r border-black/20">EVD-771-A</td>
                        <td className="p-2 text-black/90 border-r border-black/20">CCTV Snapshot (Downtown Convenience Store Gate)</td>
                        <td className="p-2 text-green-800 font-medium">Secured</td>
                      </tr>
                      <tr className="border-b border-black/20">
                        <td className="p-2 text-black/80 font-mono text-xs border-r border-black/20">EVD-771-B</td>
                        <td className="p-2 text-black/90 border-r border-black/20">Network Traffic PCAP Logs (Sector 7 Gateway Dump)</td>
                        <td className="p-2 text-green-800 font-medium">Secured</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-black/80 font-mono text-xs border-r border-black/20">EVD-771-C</td>
                        <td className="p-2 text-black/90 border-r border-black/20">Access Log CSV (City Hall Terminal Dec-04)</td>
                        <td className="p-2 text-green-800 font-medium">Secured</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Digital Signature */}
              <SignatureBlock />
            </DocumentPreview>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
