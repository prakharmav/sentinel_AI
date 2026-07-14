// ============================================================
// SentinelAI — Graph Network & Advanced Analytics Service
// Wraps all optimized Cypher graph analytic algorithms.
// ============================================================

import apiClient, { withRetry } from "../apiClient";
import type {
  GraphResponse,
  NodeSchema,
  ConnectedCriminalNode,
  CommunityDetectionResponse,
  FraudRingResponse,
  MoneyFlowPath,
  PhoneCallGraphResponse,
  VehicleMovementResponse,
  LocationCorrelationCluster,
} from "../types";

export const graphService = {
  /**
   * GET /graph/network-graph/:crime_id
   * 3-hop Neo4j traversal from a crime node.
   */
  async getNetworkGraph(
    crimeId: string,
    minRisk = 0.0,
    nodeTypes?: string[]
  ): Promise<GraphResponse> {
    return withRetry(async () => {
      const params: Record<string, unknown> = { min_risk: minRisk };
      if (nodeTypes?.length) params.node_types = nodeTypes;

      const res = await apiClient.get<GraphResponse>(
        `/graph/network-graph/${crimeId}`,
        { params }
      );
      return res.data;
    });
  },

  /**
   * GET /graph/search?q=<term>
   */
  async searchNodes(query: string): Promise<NodeSchema[]> {
    return withRetry(async () => {
      const res = await apiClient.get<NodeSchema[]>("/graph/search", {
        params: { q: query },
      });
      return res.data;
    });
  },

  /**
   * GET /graph/shortest-path
   */
  async getShortestPath(startNodeId: string, endNodeId: string): Promise<GraphResponse> {
    return withRetry(async () => {
      const res = await apiClient.get<GraphResponse>("/graph/shortest-path", {
        params: { start_node_id: startNodeId, end_node_id: endNodeId },
      });
      return res.data;
    });
  },

  /**
   * GET /graph/most-connected
   */
  async getMostConnectedCriminals(limit = 5): Promise<ConnectedCriminalNode[]> {
    return withRetry(async () => {
      const res = await apiClient.get<ConnectedCriminalNode[]>("/graph/most-connected", {
        params: { limit },
      });
      return res.data;
    });
  },

  /**
   * GET /graph/communities
   */
  async getCommunities(): Promise<CommunityDetectionResponse> {
    return withRetry(async () => {
      const res = await apiClient.get<CommunityDetectionResponse>("/graph/communities");
      return res.data;
    });
  },

  /**
   * GET /graph/fraud-rings
   */
  async getFraudRings(): Promise<FraudRingResponse> {
    return withRetry(async () => {
      const res = await apiClient.get<FraudRingResponse>("/graph/fraud-rings");
      return res.data;
    });
  },

  /**
   * GET /graph/money-flow
   */
  async getMoneyFlow(minAmount = 5000.0): Promise<MoneyFlowPath[]> {
    return withRetry(async () => {
      const res = await apiClient.get<MoneyFlowPath[]>("/graph/money-flow", {
        params: { min_amount: minAmount },
      });
      return res.data;
    });
  },

  /**
   * GET /graph/phone-call-graph
   */
  async getPhoneCallGraph(): Promise<PhoneCallGraphResponse> {
    return withRetry(async () => {
      const res = await apiClient.get<PhoneCallGraphResponse>("/graph/phone-call-graph");
      return res.data;
    });
  },

  /**
   * GET /graph/vehicle-movement
   */
  async getVehicleMovement(plateNumber: string): Promise<VehicleMovementResponse> {
    return withRetry(async () => {
      const res = await apiClient.get<VehicleMovementResponse>("/graph/vehicle-movement", {
        params: { plate_number: plateNumber },
      });
      return res.data;
    });
  },

  /**
   * GET /graph/location-correlation
   */
  async getLocationCorrelations(): Promise<LocationCorrelationCluster[]> {
    return withRetry(async () => {
      const res = await apiClient.get<LocationCorrelationCluster[]>("/graph/location-correlation");
      return res.data;
    });
  },
};
