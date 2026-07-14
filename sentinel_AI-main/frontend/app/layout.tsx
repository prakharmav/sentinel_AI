import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/queryProvider";

export const metadata: Metadata = {
  title: "SentinelAI — Threat Detection & Autonomous Response Platform",
  description:
    "AI-powered, real-time threat detection and autonomous response platform. MTTD < 10 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* React Query Provider — wraps the entire app */}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
