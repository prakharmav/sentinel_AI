// ============================================================
// SentinelAI — React Query Hooks: Graph Network
// ============================================================

"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { graphService } from "../lib/services/graphService";
import { queryKeys } from "../lib/queryKeys";
import type { GraphResponse, NodeSchema } from "../lib/types";

/**
 * useNetworkGraph
 * Fetch the Neo4j threat network centered on a crime ID.
 */
export function useNetworkGraph(
  crimeId: string,
  minRisk = 0.0,
  nodeTypes?: string[]
): UseQueryResult<GraphResponse> {
  return useQuery({
    queryKey: queryKeys.graph.network(crimeId, minRisk, nodeTypes),
    queryFn: () => graphService.getNetworkGraph(crimeId, minRisk, nodeTypes),
    enabled: Boolean(crimeId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useGraphSearch
 * Full-text search across graph nodes.
 * Only triggers when query is >= 2 characters.
 */
export function useGraphSearch(query: string): UseQueryResult<NodeSchema[]> {
  return useQuery({
    queryKey: queryKeys.graph.search(query),
    queryFn: () => graphService.searchNodes(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

/**
 * useShortestPath
 * Shortest connection path between two entities.
 */
export function useShortestPath(
  startNodeId: string,
  endNodeId: string
): UseQueryResult<GraphResponse> {
  return useQuery({
    queryKey: queryKeys.graph.shortestPath(startNodeId, endNodeId),
    queryFn: () => graphService.getShortestPath(startNodeId, endNodeId),
    enabled: Boolean(startNodeId) && Boolean(endNodeId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useMostConnectedCriminals
 */
export function useMostConnectedCriminals(
  limit = 5
): UseQueryResult<ConnectedCriminalNode[]> {
  return useQuery({
    queryKey: queryKeys.graph.mostConnected(limit),
    queryFn: () => graphService.getMostConnectedCriminals(limit),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * useCommunities
 */
export function useCommunities(): UseQueryResult<CommunityDetectionResponse> {
  return useQuery({
    queryKey: queryKeys.graph.communities(),
    queryFn: () => graphService.getCommunities(),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * useFraudRings
 */
export function useFraudRings(): UseQueryResult<FraudRingResponse> {
  return useQuery({
    queryKey: queryKeys.graph.fraudRings(),
    queryFn: () => graphService.getFraudRings(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * useMoneyFlow
 */
export function useMoneyFlow(
  minAmount = 5000.0
): UseQueryResult<MoneyFlowPath[]> {
  return useQuery({
    queryKey: queryKeys.graph.moneyFlow(minAmount),
    queryFn: () => graphService.getMoneyFlow(minAmount),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * usePhoneCallGraph
 */
export function usePhoneCallGraph(): UseQueryResult<PhoneCallGraphResponse> {
  return useQuery({
    queryKey: queryKeys.graph.phoneCallGraph(),
    queryFn: () => graphService.getPhoneCallGraph(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * useVehicleMovement
 */
export function useVehicleMovement(
  plateNumber: string
): UseQueryResult<VehicleMovementResponse> {
  return useQuery({
    queryKey: queryKeys.graph.vehicleMovement(plateNumber),
    queryFn: () => graphService.getVehicleMovement(plateNumber),
    enabled: Boolean(plateNumber),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useLocationCorrelations
 */
export function useLocationCorrelations(): UseQueryResult<
  LocationCorrelationCluster[]
> {
  return useQuery({
    queryKey: queryKeys.graph.locationCorrelation(),
    queryFn: () => graphService.getLocationCorrelations(),
    staleTime: 10 * 60 * 1000,
  });
}
