// ============================================================
// SentinelAI — React Query Provider
// Configures: stale time, retry logic, error handling, devtools.
// ============================================================

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SentinelApiError } from "./types";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 2 minutes before a background refetch
        staleTime: 2 * 60 * 1000,
        // Keep data in cache for 10 minutes after components unmount
        gcTime: 10 * 60 * 1000,
        // Retry up to 2 times on failure, but never on 4xx client errors
        retry: (failureCount, error) => {
          if (error instanceof SentinelApiError) {
            // Never retry client errors
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
        // Exponential back-off: 1s, 2s, 4s
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        // Refetch on window focus so dashboards stay live
        refetchOnWindowFocus: true,
      },
      mutations: {
        // Mutations never retry automatically
        retry: false,
      },
    },
  });
}

// Singleton for server components
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new QueryClient
    return makeQueryClient();
  }
  // Browser: reuse the same client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { getQueryClient };
