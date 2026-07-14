// ============================================================
// SentinelAI — React Query Hooks: Crimes
// ============================================================

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { crimeService } from "../lib/services/crimeService";
import { queryKeys } from "../lib/queryKeys";
import type { CrimeCreateRequest, CrimeResponse } from "../lib/types";

/**
 * useCrimes
 * List all crimes for the current tenant.
 */
export function useCrimes(
  skip = 0,
  limit = 100
): UseQueryResult<CrimeResponse[]> {
  return useQuery({
    queryKey: queryKeys.crimes.list({ skip, limit }),
    queryFn: () => crimeService.listCrimes({ skip, limit }),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * useCrime
 * Fetch a single crime by UUID.
 */
export function useCrime(id: string): UseQueryResult<CrimeResponse> {
  return useQuery({
    queryKey: queryKeys.crimes.detail(id),
    queryFn: () => crimeService.getCrime(id),
    enabled: Boolean(id),
  });
}

/**
 * useCreateCrime
 * Mutation to register a new crime. Invalidates the crimes list on success.
 */
export function useCreateCrime(): UseMutationResult<
  CrimeResponse,
  Error,
  CrimeCreateRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crimeService.createCrime,
    onSuccess: () => {
      // Invalidate the list so it refetches with the new record
      queryClient.invalidateQueries({ queryKey: queryKeys.crimes.all() });
    },
  });
}
